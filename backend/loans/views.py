from django.db.models import Q
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import BasePermission
from rest_framework.response import Response

from users.models import User
from users.permissions import HasLoanAccess, has_role

from .models import LoanApplication, LoanApplicationDocument, LoanApplicationGuarantor, LoanProduct
from .serializers import (
	LoanApprovalSerializer,
	LoanApplicationDetailSerializer,
	LoanApplicationDocumentSerializer,
	LoanApplicationGuarantorSerializer,
	LoanApplicationListSerializer,
	LoanDisbursementSerializer,
	LoanRepaymentSerializer,
	LoanRejectionSerializer,
	LoanTypeSerializer,
)
from .services import build_eligibility_summary, disburse_application, post_installment_repayment


REVIEW_ROLES = {User.ADMIN, User.MANAGER, User.OPERATION}
OFFICER_ROLES = {User.ADMIN, User.LOAN}


class HasLoanTypeManagementAccess(BasePermission):
	def has_permission(self, request, view):
		if request.method in ("GET", "HEAD", "OPTIONS"):
			return has_role(request.user, {User.ADMIN, User.MANAGER, User.OPERATION, User.LOAN})
		return has_role(request.user, {User.ADMIN, User.MANAGER})


class LoanTypeViewSet(viewsets.ModelViewSet):
	queryset = LoanProduct.objects.all().order_by("name")
	serializer_class = LoanTypeSerializer
	permission_classes = [HasLoanTypeManagementAccess]


class LoanApplicationViewSet(
	mixins.CreateModelMixin,
	mixins.ListModelMixin,
	mixins.RetrieveModelMixin,
	mixins.UpdateModelMixin,
	viewsets.GenericViewSet,
):
	permission_classes = [HasLoanAccess]
	lookup_field = "application_number"

	def get_queryset(self):
		queryset = LoanApplication.objects.select_related(
			"member",
			"loan_type",
			"created_by",
			"submitted_by",
			"reviewed_by",
			"approved_by",
			"rejected_by",
			"disbursed_by",
		).prefetch_related("guarantors__member", "documents")

		params = self.request.query_params
		status_value = params.get("status")
		loan_type = params.get("loan_type")
		member = params.get("member")
		search = params.get("search")
		date_from = params.get("date_from")
		date_to = params.get("date_to")

		if status_value:
			queryset = queryset.filter(status=status_value)
		if loan_type:
			queryset = queryset.filter(loan_type_id=loan_type)
		if member:
			queryset = queryset.filter(member__membership_number=member)
		if date_from:
			queryset = queryset.filter(created_at__date__gte=date_from)
		if date_to:
			queryset = queryset.filter(created_at__date__lte=date_to)
		if search:
			queryset = queryset.filter(
				Q(application_number__icontains=search)
				| Q(member__membership_number__icontains=search)
				| Q(member__first_name__icontains=search)
				| Q(member__last_name__icontains=search)
			)

		return queryset

	def get_serializer_class(self):
		if self.action == "list":
			return LoanApplicationListSerializer
		return LoanApplicationDetailSerializer

	def perform_update(self, serializer):
		if not has_role(self.request.user, OFFICER_ROLES):
			raise PermissionError("Only loan officers or admins can edit draft applications.")
		serializer.save()

	def update(self, request, *args, **kwargs):
		if not has_role(request.user, OFFICER_ROLES):
			return Response({"detail": "Only loan officers or admins can edit draft applications."}, status=status.HTTP_403_FORBIDDEN)
		return super().update(request, *args, **kwargs)

	def partial_update(self, request, *args, **kwargs):
		if not has_role(request.user, OFFICER_ROLES):
			return Response({"detail": "Only loan officers or admins can edit draft applications."}, status=status.HTTP_403_FORBIDDEN)
		return super().partial_update(request, *args, **kwargs)

	def create(self, request, *args, **kwargs):
		if not has_role(request.user, OFFICER_ROLES):
			return Response({"detail": "Only loan officers or admins can create loan applications."}, status=status.HTTP_403_FORBIDDEN)
		return super().create(request, *args, **kwargs)

	@action(detail=False, methods=["get"], url_path="dashboard")
	def dashboard(self, request):
		queryset = self.get_queryset()
		counts = {
			status_value: queryset.filter(status=status_value).count()
			for status_value, _ in LoanApplication.Status.choices
		}
		recent = LoanApplicationListSerializer(queryset[:5], many=True).data
		return Response({"counts": counts, "recent_applications": recent})

	@action(detail=True, methods=["post"], url_path="submit")
	def submit(self, request, application_number=None):
		if not has_role(request.user, OFFICER_ROLES):
			return Response({"detail": "Only loan officers or admins can submit applications."}, status=status.HTTP_403_FORBIDDEN)

		application = self.get_object()
		summary = build_eligibility_summary(application)
		try:
			application.submit(request.user, warnings=summary["warnings"])
		except ValueError as exc:
			return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

		serializer = LoanApplicationDetailSerializer(application, context={"request": request})
		return Response(serializer.data)

	@action(detail=True, methods=["post"], url_path="review")
	def review(self, request, application_number=None):
		if not has_role(request.user, REVIEW_ROLES):
			return Response({"detail": "Only managers, operations managers, or admins can review applications."}, status=status.HTTP_403_FORBIDDEN)

		application = self.get_object()
		try:
			application.start_review(request.user)
		except ValueError as exc:
			return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

		return Response(LoanApplicationDetailSerializer(application, context={"request": request}).data)

	@action(detail=True, methods=["post"], url_path="approve")
	def approve(self, request, application_number=None):
		if not has_role(request.user, REVIEW_ROLES):
			return Response({"detail": "Only managers, operations managers, or admins can approve applications."}, status=status.HTTP_403_FORBIDDEN)

		application = self.get_object()
		serializer = LoanApprovalSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)

		try:
			application.approve(request.user, serializer.validated_data["approval_notes"])
		except ValueError as exc:
			return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

		return Response(LoanApplicationDetailSerializer(application, context={"request": request}).data)

	@action(detail=True, methods=["post"], url_path="reject")
	def reject(self, request, application_number=None):
		if not has_role(request.user, REVIEW_ROLES):
			return Response({"detail": "Only managers, operations managers, or admins can reject applications."}, status=status.HTTP_403_FORBIDDEN)

		application = self.get_object()
		serializer = LoanRejectionSerializer(data=request.data)
		serializer.is_valid(raise_exception=True)

		try:
			application.reject(request.user, serializer.validated_data["rejection_reason"])
		except ValueError as exc:
			return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

		return Response(LoanApplicationDetailSerializer(application, context={"request": request}).data)

	@action(detail=True, methods=["post"], url_path="disburse")
	def disburse(self, request, application_number=None):
		if not has_role(request.user, REVIEW_ROLES):
			return Response({"detail": "Only managers, operations managers, or admins can disburse applications."}, status=status.HTTP_403_FORBIDDEN)

		application = self.get_object()
		serializer = LoanDisbursementSerializer(data=request.data, context={"application": application})
		serializer.is_valid(raise_exception=True)

		try:
			disburse_application(
				application=application,
				account=serializer.context["account"],
				user=request.user,
				notes=serializer.validated_data["disbursement_notes"],
			)
		except ValueError as exc:
			return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

		application.refresh_from_db()
		return Response(LoanApplicationDetailSerializer(application, context={"request": request}).data)

	@action(detail=True, methods=["post"], url_path="repay")
	def repay(self, request, application_number=None):
		if not has_role(request.user, REVIEW_ROLES):
			return Response({"detail": "Only managers, operations managers, or admins can post repayments."}, status=status.HTTP_403_FORBIDDEN)

		application = self.get_object()
		serializer = LoanRepaymentSerializer(data=request.data, context={"application": application})
		serializer.is_valid(raise_exception=True)
		try:
			post_installment_repayment(
				loan=serializer.context["loan"],
				installment_number=serializer.validated_data["installment_number"],
				account=serializer.context["account"],
				user=request.user,
				narration=serializer.validated_data["narration"],
			)
		except ValueError as exc:
			return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

		application.refresh_from_db()
		return Response(LoanApplicationDetailSerializer(application, context={"request": request}).data)

	@action(detail=True, methods=["get", "post"], url_path="guarantors")
	def guarantors(self, request, application_number=None):
		application = self.get_object()

		if request.method == "GET":
			serializer = LoanApplicationGuarantorSerializer(application.guarantors.select_related("member"), many=True)
			return Response(serializer.data)

		if not has_role(request.user, OFFICER_ROLES):
			return Response({"detail": "Only loan officers or admins can add guarantors."}, status=status.HTTP_403_FORBIDDEN)
		if application.status != LoanApplication.Status.DRAFT:
			return Response({"detail": "Guarantors can only be modified while the application is in draft."}, status=status.HTTP_400_BAD_REQUEST)

		serializer = LoanApplicationGuarantorSerializer(
			data=request.data,
			context={"application": application},
		)
		serializer.is_valid(raise_exception=True)
		serializer.save(application=application)
		return Response(serializer.data, status=status.HTTP_201_CREATED)

	@action(detail=True, methods=["delete"], url_path=r"guarantors/(?P<guarantor_id>[^/.]+)")
	def remove_guarantor(self, request, application_number=None, guarantor_id=None):
		if not has_role(request.user, OFFICER_ROLES):
			return Response({"detail": "Only loan officers or admins can remove guarantors."}, status=status.HTTP_403_FORBIDDEN)

		application = self.get_object()
		if application.status != LoanApplication.Status.DRAFT:
			return Response({"detail": "Guarantors can only be modified while the application is in draft."}, status=status.HTTP_400_BAD_REQUEST)

		guarantor = application.guarantors.filter(pk=guarantor_id).first()
		if guarantor is None:
			return Response({"detail": "Guarantor not found."}, status=status.HTTP_404_NOT_FOUND)
		guarantor.delete()
		return Response(status=status.HTTP_204_NO_CONTENT)

	@action(detail=True, methods=["get", "post"], url_path="documents")
	def documents(self, request, application_number=None):
		application = self.get_object()

		if request.method == "GET":
			serializer = LoanApplicationDocumentSerializer(application.documents.all(), many=True, context={"request": request})
			return Response(serializer.data)

		if not has_role(request.user, OFFICER_ROLES):
			return Response({"detail": "Only loan officers or admins can upload documents."}, status=status.HTTP_403_FORBIDDEN)
		if application.status != LoanApplication.Status.DRAFT:
			return Response({"detail": "Documents can only be modified while the application is in draft."}, status=status.HTTP_400_BAD_REQUEST)

		serializer = LoanApplicationDocumentSerializer(data=request.data, context={"request": request})
		serializer.is_valid(raise_exception=True)
		serializer.save(application=application, uploaded_by=request.user)
		return Response(serializer.data, status=status.HTTP_201_CREATED)

	@action(detail=True, methods=["delete"], url_path=r"documents/(?P<document_id>[^/.]+)")
	def remove_document(self, request, application_number=None, document_id=None):
		if not has_role(request.user, OFFICER_ROLES):
			return Response({"detail": "Only loan officers or admins can delete documents."}, status=status.HTTP_403_FORBIDDEN)

		application = self.get_object()
		if application.status != LoanApplication.Status.DRAFT:
			return Response({"detail": "Documents can only be modified while the application is in draft."}, status=status.HTTP_400_BAD_REQUEST)

		document = application.documents.filter(pk=document_id).first()
		if document is None:
			return Response({"detail": "Document not found."}, status=status.HTTP_404_NOT_FOUND)
		document.delete()
		return Response(status=status.HTTP_204_NO_CONTENT)

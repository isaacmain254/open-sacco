from django.shortcuts import render
from django.shortcuts import get_object_or_404
from rest_framework import viewsets,  mixins
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Member
from .serializers import MemberSerializer


# class MemberViewSet(viewsets.ViewSet):
#     """
#     A ViewSet for listing and retrieving members information
#     """
#     permission_classes = [IsAuthenticated]
#     # lookup_field = "id"

#     def list(self, request):
#         queryset = Member.objects.all()
#         serializer = MemberSerializer(queryset, many=True)
#         return Response(serializer.data)

#     def retrieve(self, request, pk=None):
#         queryset = Member.objects.all().prefetch_related('next_of_kin')
#         member = get_object_or_404(queryset, pk=pk)
#         serializer = MemberSerializer(member)
#         return Response(serializer.data)

class MemberViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet
):
    queryset = Member.objects.all().prefetch_related("next_of_kin")
    serializer_class = MemberSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"

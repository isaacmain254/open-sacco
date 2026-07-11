from django.db import migrations, models

import loans.models


class Migration(migrations.Migration):

    dependencies = [
        ("loans", "0003_loan_application_workflow"),
    ]

    operations = [
        migrations.AlterField(
            model_name="loanapplicationdocument",
            name="file",
            field=models.FileField(upload_to=loans.models.loan_document_upload_path),
        ),
    ]

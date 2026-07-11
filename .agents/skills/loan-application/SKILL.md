# Feature Specification: Loan Application Module

## Objective

Build an end-to-end Loan Application module for the SACCO Management System.

The system already contains:

* Authentication
* Role-based access control
* Members module
* Member Accounts module
* Transactions module

Do **not** modify these existing modules unless necessary for integration.

The focus of this task is implementing the complete loan workflow from application to disbursement.

---

# Technology

Frontend

* React
* Existing UI components
* Existing authentication and permissions

Backend

* Django
* Django REST Framework
* Existing authentication
* Existing permission system

---

# Roles

The system already has access control.

Use the following permissions.

## Admin

Has full system access.

Although Admin can technically access everything, loan processing is not part of the normal workflow.

Admin should simply inherit all permissions.

---

## Loan Officer

Can:

* Create loan applications
* Edit draft applications
* View all applications
* Upload scanned documents
* Submit applications
* View application status

Cannot:

* Approve loans
* Reject loans
* Disburse loans

---

## Operations Manager

Can:

* View all applications
* Approve applications
* Reject applications
* Disburse approved loans
* View loan history

Cannot edit application details after submission.

---

## Manager

Same permissions as Operations Manager.

---

## Members

Members do **not** log into the system to apply.

Loan applications are submitted manually.

A Loan Officer receives the physical application form, scans it, and enters it into the system.

---

# Loan Workflow

The workflow should be strictly manual.

```
Draft

↓

Submitted

↓

Under Review

↓

Approved
or
Rejected

↓

Disbursed
```

No automatic approval.

No automatic disbursement.

Every stage requires a user action.

---

# Loan Application Process

Loan Officer creates a new loan application.

The application is linked to an existing member.

The officer enters information from the physical loan form.

The officer uploads scanned copies of supporting documents.

After confirming the information, the officer submits the application.

Once submitted:

* Loan Officer can no longer edit it.
* Status becomes:

```
Submitted
```

Managers will then review it.

---

# Loan Eligibility Checks

The system should assist users by performing validation checks.

These checks do **not** automatically reject the application.

Instead, they display warnings.

Check:

## Membership duration

Display:

* Membership date
* Number of months as member

Warn if member has not met minimum membership period.

Configurable value:

```
Minimum membership months = 3
```

---

## Share contributions

Display:

* Current deposits
* Monthly contribution

Warn if minimum contributions are not met.

---

## Loan multiplier

Most SACCOs lend

3x–5x deposits.

Initially support one configurable multiplier.

Example

```
Loan multiplier = 3
```

Maximum eligible loan

```
Deposits × Multiplier
```

Example

Deposits

100,000

Eligible amount

300,000

If requested amount exceeds limit:

Show warning.

Do not block submission.

Managers make final decision.

---

## Existing loans

Display:

* Active loans
* Outstanding balance

Warn if member already has unpaid loans.

---

## Two-thirds salary rule

If salary information exists:

Calculate

Monthly deductions

must not exceed

2/3 gross salary.

Warn if exceeded.

Do not block submission.

---

# Loan Types

Create a Loan Type model.

Fields:

* Name
* Interest rate
* Repayment period (months)
* Multiplier
* Active

Examples

* Normal Loan
* Emergency Loan
* Development Loan
* School Fees Loan

Loan application references one Loan Type.

---

# Loan Application Fields

Create Loan Application model.

Suggested fields

General

* Application Number
* Member
* Loan Type
* Requested Amount
* Purpose
* Repayment Period

Employment

* Employer
* Payroll Number
* Gross Salary
* Net Salary

Security

* Security Type

Values

* Self Guarantee
* Guarantors
* Collateral

Collateral description

(optional)

Remarks

Status

* Draft
* Submitted
* Under Review
* Approved
* Rejected
* Disbursed

Audit

* Created By
* Submitted By
* Approved By
* Disbursed By

Dates

* Created At
* Submitted At
* Approved At
* Disbursed At

Approval

* Approval Notes
* Rejection Reason

Disbursement

* Disbursement Notes

---

# Guarantors

Support guarantors.

Each guarantor references an existing member.

Store

* Member
* Guaranteed Amount

Display

Total guaranteed amount.

Warn if

Total guaranteed amount

< Requested loan.

Allow self-guarantee when:

Requested amount <= member deposits.

---

# Supporting Documents

Allow multiple uploaded files.

Examples

* Loan Application Form
* National ID
* Payslips
* Bank Statement
* Title Deed
* Vehicle Logbook

Store

* File
* Document Type
* Uploaded By
* Uploaded Date

Loan Officers upload these documents.

Managers can only view/download them.

---

# Loan Review Screen

Managers should have a review page.

Display

Member Summary

* Member Number
* Name
* Membership Date
* Deposits
* Existing Loans
* Outstanding Balance

Loan Details

Eligibility Summary

Guarantors

Uploaded Documents

Warnings

Buttons

Approve

Reject

No automatic workflow.

Approval simply changes status.

---

# Approval

When manager clicks Approve

Status

```
Approved
```

Store

Approved By

Approved Date

Approval Notes

---

# Rejection

Manager enters reason.

Status

```
Rejected
```

Store

Rejected By

Rejected Date

Reason

---

# Disbursement

Approved loans appear in a separate list.

Managers click

Disburse.

Before disbursement

Confirm action.

When confirmed

Status

```
Disbursed
```

Store

Disbursed By

Disbursed Date

Disbursement Notes

Then create a transaction using the existing Transactions module.

Credit the member's existing account.

Do not create new account logic.

Use the existing account infrastructure.

---

# Loan Dashboard

Create dashboard cards.

Applications

* Draft
* Submitted
* Under Review
* Approved
* Rejected
* Disbursed

Show recent applications.

Provide quick filters.

---

# Loan List

Columns

Application Number

Member

Loan Type

Amount

Status

Date Applied

Loan Officer

Approver

Actions

Filters

Status

Loan Type

Member

Date Range

Search

Member Name

Application Number

Member Number

---

# Loan Details Page

Display complete loan history.

Timeline

Created

Submitted

Approved

Disbursed

Uploaded documents

Guarantors

Warnings generated during application

Approval notes

Disbursement notes

Audit log

---

# Notifications (Simple)

Display in-app notifications only.

Examples

Loan submitted successfully.

Loan approved.

Loan rejected.

Loan disbursed.

No email or SMS integration.

---

# API Endpoints

Loan Types

* List
* Create
* Update
* Delete

Loan Applications

* Create
* Update Draft
* Submit
* List
* Retrieve

Approval

* Approve
* Reject

Disbursement

* Disburse

Documents

* Upload
* Delete
* List

Guarantors

* Add
* Remove
* List

---

# Validation

Required

Member

Loan Type

Amount

Purpose

Repayment Period

Status transitions

Draft

→ Submitted

Submitted

→ Under Review

Under Review

→ Approved

or

Rejected

Approved

→ Disbursed

Disallow invalid transitions.

---

# UI Requirements

Loan application should be a multi-step form.

Suggested steps

1. Member Selection

2. Loan Details

3. Employment Details

4. Security / Guarantors

5. Supporting Documents

6. Review & Submit

Display eligibility warnings in a sidebar while filling the form.

Use badges for loan status.

Use confirmation dialogs for

Approve

Reject

Disburse

---

# Audit Trail

Every important action should be recorded.

Track

Who created the application

Who submitted it

Who approved it

Who rejected it

Who disbursed it

When each action occurred

This history should be visible on the loan details page.

---

# Future Enhancements (Do Not Implement Now)

The architecture should make it easy to add later:

* Interest calculations
* Loan repayment schedules
* Automatic monthly deductions
* Penalties
* Loan restructuring
* Partial disbursement
* Digital member applications
* Email/SMS notifications
* Credit committee workflow
* Electronic guarantor approvals
* CRB integration
* Configurable approval chains
* Automatic eligibility rules
* Automatic loan posting to accounting

Do not implement these features now.

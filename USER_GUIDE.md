# Open SACCO User Guide

This short guide describes the usual workflow for SACCO staff. The modules you see depend on your assigned role.

## Start with the member

1. Open **Members** and select **Create Member**.
2. Enter the member’s identity, contact, next-of-kin, and employment information, then save.
3. Use the member page to review their accounts, transactions, and loan applications.

## Create an account and post transactions

1. Open **Accounts** and select **Create Account**.
2. Choose the member and an active savings product, then save the account.
3. Open the account to check its balance and transaction history.
4. Select **New transaction** (or use **Transactions → Create Transaction**) to post a deposit or withdrawal. Confirm the account number, transaction type, amount, and narration before saving.

An account must exist before transactions can be posted or a loan can be disbursed to it.

## Process a loan application

1. In **Loans**, select **Apply loan** and find the member.
2. Enter the loan type, requested amount, repayment period, purpose, and security details.
3. Save the application as a draft. Add supporting documents and, where required, search for and add guarantors with their guaranteed amounts.
4. Submit the draft for review.
5. An authorised reviewer starts review, then approves or rejects the application with notes.
6. For an approved application, choose the member’s destination account and disburse the loan.

Use the loan detail page to see eligibility warnings, guarantors, documents, and the workflow history.

## Manage products and staff

- Administrators and managers manage staff from **Users**.
- Configure savings products and loan products in the Django **Admin** site before staff create accounts or applications that use them. Administrators can access it at `/admin`.
- Keep inactive products or accounts out of new work; retain them for historical records instead of deleting financial data.

## Daily checks

- Review the **Dashboard** for cash flow, recent activity, and loan applications awaiting review.
- Search list pages by identifiers, names, amounts, or status rather than scrolling long lists.
- Use transaction and account detail views to confirm balances and narration before correcting an issue.

## Good practice

- Verify the member and account number before saving a financial transaction.
- Record a clear narration for every transaction.
- Attach the required loan documents before submission and capture the reason for every rejection.
- Use the sidebar **Logout** button when you finish, especially on shared devices.


const Help = () => {
  return (
    <div className="mx-auto max-w-3xl space-y-5 py-2">
      <div>
        <h1 className="text-2xl font-medium">Help</h1>
        <p className="mt-1 text-sm text-slate-500">Use the standard workflow below to keep member, account, transaction, and loan records connected.</p>
      </div>
      <div className="rounded-lg border p-5">
        <h2 className="font-medium">Core workflow</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700 dark:text-slate-300">
          <li>Create the member and confirm their details.</li>
          <li>Create a savings account for that member.</li>
          <li>Post deposits or withdrawals to the account with a clear narration.</li>
          <li>Create and save a loan application as a draft, then add documents and guarantors where needed.</li>
          <li>Submit the application for review; an authorised user approves, rejects, or disburses it.</li>
        </ol>
      </div>
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-5 text-sm text-blue-950 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-100">
        <h2 className="font-medium">Full guide</h2>
        <p className="mt-2">The complete staff workflow is maintained in <a className="text-blue-600 underline" href="https://github.com/isaacmain254/open-sacco/blob/main/USER_GUIDE.md">USER_GUIDE.md</a> at the root of the Open SACCO project repository.</p>
      </div>
    </div>
  )
}

export default Help

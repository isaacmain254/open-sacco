import React from "react";

const CustomersView = () => {
  return (
    <div>
      <h1 className="text-2xl font-medium">Member Details</h1>
      <div className="my-5 space-y-10 lg:space-y-0 lg:grid lg:grid-cols-12 gap-8">
        <div className="col-span-3  space-y-8">
          <div className="bg-gray-200/50 p-5 rounded-md dark:bg-blue-900">
            <div className="font-medium">
              AccountNo: <span className="font-light">1234456</span>
            </div>
            <div className="font-medium">
              ID No.: <span className="font-light">1425767</span>
            </div>
            <div className="font-medium">
              Salutation: <span className="font-light">Mr</span>
            </div>
            <div className="font-medium">
              Name: <span className="font-light">John Doe</span>
            </div>
            <div className="font-medium">
              Name: <span className="font-light">John Doe</span>
            </div>
            <div className="font-medium">
              Phone Number: <span className="font-light">86905099</span>
            </div>
            <div className="font-medium">
              Email: <span className="font-light">helo@gmail.com</span>
            </div>
            <div className="font-medium">
              Date of Birth: <span className="font-light">12/3/2003</span>
            </div>
            <div className="font-medium">
              Tax No: <span className="font-light">A0876867867854</span>
            </div>
          </div>
          <div className="bg-gray-200/50 p-5 rounded-md dark:bg-blue-900">
          <div className="font-medium">
              Country: <span className="font-light">Kenya</span>
            </div>
            <div className="font-medium">
              County: <span className="font-light">Muranga</span>
            </div>
            <div className="font-medium">
              Ward: <span className="font-light">Kamacharia</span>
            </div>
            <div className="font-medium">
            City: <span className="font-light">Kiriaini</span>
            </div>
            <div className="font-medium">
              P.O. Box: <span className="font-light">123</span>
            </div>
          </div>
        </div>
        <div className='col-span-9 space-y-8'>
          <div className=" bg-gray-200/50 p-5 rounded-md dark:bg-blue-900">
          Customer accounts
          </div>
          <div className=" bg-gray-200/50 p-5 rounded-md dark:bg-blue-900">
          Customer Transaction
          </div>
          <div className=" bg-gray-200/50 p-5 rounded-md dark:bg-blue-900">
          Customer Loans
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomersView;

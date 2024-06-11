import { FC } from "react";
import { Link, useRouteError } from "react-router-dom";

export interface RouteError {
  status: number;
  statusText: string;
  message: string;
}
const ErrorPage: FC = () => {
  const error = useRouteError() as RouteError;

  return (
    <div className="w-full h-screen flex flex-col items-center font-roboto justify-center dark:bg-gray-600 dark:text-white">
      <h1 className="text-4xl font-bold  ">Oops! </h1>
      <p className=" my-3 text-base font-medium ">
        Sorry, an unexpected error has occurred.
      </p>
      <p>
        <i>
          {error.status} {error.statusText || error.message}
        </i>
      </p>
      <Link to="/" className="text-blue-600 underline mt-5">
        Take me home
      </Link>
    </div>
  );
};

export default ErrorPage;

import { FC } from "react";
import { useRouteError } from "react-router-dom";

export interface RouteError {
  status: number;
  statusText: string;
  message: string;
}
const ErrorPage: FC = () => {
  const error = useRouteError() as RouteError;

  return (
    <div className="w-full h-screen flex flex-col items-center font-roboto justify-center">
      <h1 className="text-4xl font-bold  ">Oops! </h1>
      <p className=" my-3 text-base font-medium ">
        Sorry, an unexpected error has occurred.
      </p>
      <p>
        <i>
          {error.status} {error.statusText || error.message}
        </i>
      </p>
    </div>
  );
};

export default ErrorPage;

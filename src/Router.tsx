import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./app/App";
import Login from "./app/Login";
import { Base } from "./components/Base";


export const Router = () => {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <Base />,
            children: [
                {
                    path: "",
                    element: <App />,
                }
            ],
        },
        {
            path: "/login",
            element: <Login />,
        }
    ]);

    return <RouterProvider router={router} />
}
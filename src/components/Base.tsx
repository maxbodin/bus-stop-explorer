import { Outlet } from "react-router-dom";


export const Base = () => {
    return (
        <>
            <h1>Bus Stop Explorer</h1>
            <Outlet />
        </>
    );
}
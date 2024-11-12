import "../styles/login.css";

export default function Login() {

    return (
        <div id="login-page">
            <div id="login-container">
                <h1>Login</h1>
                <form>
                    <input type="text" placeholder="Username" />
                    <input type="password" placeholder="Password" />
                    <button type="submit">Login</button>
                </form>
            </div>
            <div id="login-background">
                <h2>
                    Welcome to the
                    <br />
                    Bus Stop Explorer
                </h2>
            </div>
        </div>
    );
}
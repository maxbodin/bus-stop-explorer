import { GithubAuthProvider } from "@/services/auth/GithubAuthProvider";
import "../styles/login.css";

export default function Login() {
    const provider = new GithubAuthProvider();

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const form = event.currentTarget;
        
    }

    return (
        <div id="login-page">
            <div id="login-container">
                <h1>Login</h1>
                <form onSubmit={onSubmit}>
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
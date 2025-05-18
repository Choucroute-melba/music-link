import {redirect} from "next/navigation";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (!code || !state) {
        redirect("/login/error?error=missing_code_or_state");
        return;
    }
    if (error) {
        redirect("/login/error?error=" + error);
        return;
    }



    return new Response('Login successful', { status: 200 });

}
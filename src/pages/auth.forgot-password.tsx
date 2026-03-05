import { Form, Link, useActionData, useNavigation } from 'react-router';
import { Mail, ArrowLeft, Loader2, Wallet } from 'lucide-react';
import type { ActionFunctionArgs, MetaFunction } from 'react-router';

export const meta: MetaFunction = () => {
  return [
    { title: 'Forgot Password | Finance Tracker' },
    { name: 'description', content: 'Reset your password for Finance Tracker' },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email');

  if (!email || typeof email !== 'string') {
    return Response.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    // In a real app, integrate Better Auth password reset here
    // Example: await auth.api.forgetPassword({ email })
    
    // Simulating API call
    await new Promise(resolve => setTimeout(resolve, 800));

    return Response.json({ 
      success: true, 
      message: 'If an account exists with this email, a reset link has been sent.' 
    });
  } catch (error) {
    return Response.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}

export default function ForgotPassword() {
  const actionData = useActionData<{ error?: string; success?: boolean; message?: string }>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  return (
    <div className="min-h-screen flex text-gray-900 bg-gray-50 dark:bg-[#0A0A0E] dark:text-gray-100 selection:bg-blue-500/30">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 relative z-10 w-full lg:w-[480px]">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-blue-500/10 dark:bg-blue-500/20 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-indigo-500/10 dark:bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2" />

        <div className="mx-auto w-full max-w-sm lg:w-[380px] relative z-20">
          <Link 
            to="/auth/login" 
            className="group mb-8 inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to sign in
          </Link>

          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-xl shadow-blue-600/20 dark:shadow-blue-900/40">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Finance Tracker</h1>
            </div>
          </div>

          <div className="bg-white/90 dark:bg-white/5 backdrop-blur-3xl rounded-3xl p-8 shadow-2xl shadow-gray-200/50 dark:shadow-black/50 border border-gray-100 dark:border-white/10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent dark:from-white/5 pointer-events-none opacity-50" />
            
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white mb-2 relative z-10">
              Reset Password
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 relative z-10">
              Enter your email address to receive a password reset link.
            </p>

            {actionData?.error && (
              <div className="mb-6 rounded-2xl bg-red-50 dark:bg-red-500/10 p-4 border border-red-100 dark:border-red-500/20 relative z-10">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
                      Error
                    </h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                      <p>{actionData.error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {actionData?.success ? (
              <div className="bg-green-50 dark:bg-emerald-500/10 border border-green-200 dark:border-emerald-500/20 rounded-2xl p-6 text-center relative z-10">
                <Mail className="mx-auto h-10 w-10 text-green-500 dark:text-emerald-400 mb-4" />
                <h3 className="text-lg font-medium text-green-800 dark:text-emerald-400 mb-2">Check your email</h3>
                <p className="text-sm text-green-700 dark:text-emerald-300 mb-6">
                  {actionData.message}
                </p>
                <Link
                  to="/auth/login"
                  className="inline-flex w-full justify-center rounded-xl bg-green-600 dark:bg-emerald-600 hover:bg-green-700 dark:hover:bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-colors"
                >
                  Return to login
                </Link>
              </div>
            ) : (
              <Form method="post" className="space-y-6 relative z-10">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200">
                    Email address
                  </label>
                  <div className="mt-2 relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      tabIndex={1}
                      className="block w-full rounded-2xl border-0 py-3.5 pl-11 pr-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 hover:ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:hover:ring-white/20 dark:focus:ring-blue-500 transition-shadow bg-white/50 backdrop-blur-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    tabIndex={2}
                    disabled={isSubmitting}
                    className="flex w-full justify-center rounded-2xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-blue-500 hover:shadow-blue-500/25 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all disabled:opacity-70 disabled:pointer-events-none relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite]" />
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending reset link...
                      </>
                    ) : (
                      'Send reset link'
                    )}
                  </button>
                </div>
              </Form>
            )}
          </div>
        </div>
      </div>
      
      {/* Decorative Brand Background */}
      <div className="relative hidden w-0 flex-1 lg:block bg-[#020817] overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0E] via-[#0A0A0E]/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0A0A0E] to-transparent" />
      </div>
    </div>
  );
}

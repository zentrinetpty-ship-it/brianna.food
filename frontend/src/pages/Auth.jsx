import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from || "/account";

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.ok) {
      toast.success("Welcome back!");
      navigate(from);
    } else {
      toast.error(res.error || "Login failed");
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to your Brianna account" testId="login-page">
      <form onSubmit={submit} className="space-y-4">
        <Field icon={Mail} label="Email" type="email" value={email} onChange={setEmail} testId="login-email" />
        <Field icon={Lock} label="Password" type="password" value={password} onChange={setPassword} testId="login-password" />
        <Button disabled={loading} type="submit" className="w-full h-12 rounded-full bg-nigeria-orange hover:bg-[#E64A00] font-black" data-testid="login-submit">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
        </Button>
        <p className="text-center text-sm text-muted-foreground pt-2">
          New here? <Link to="/register" className="font-black text-nigeria-orange hover:underline" data-testid="to-register">Create an account</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await register(name, email, password);
    setLoading(false);
    if (res.ok) {
      toast.success("Welcome to Brianna!");
      navigate("/account");
    } else {
      toast.error(res.error || "Signup failed");
    }
  };

  return (
    <AuthShell title="Join the diaspora" subtitle="Create your account — takes 30 seconds" testId="register-page">
      <form onSubmit={submit} className="space-y-4">
        <Field icon={User} label="Full name" value={name} onChange={setName} testId="register-name" />
        <Field icon={Mail} label="Email" type="email" value={email} onChange={setEmail} testId="register-email" />
        <Field icon={Lock} label="Password" type="password" value={password} onChange={setPassword} testId="register-password" />
        <Button disabled={loading} type="submit" className="w-full h-12 rounded-full bg-nigeria-orange hover:bg-[#E64A00] font-black" data-testid="register-submit">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create account"}
        </Button>
        <p className="text-center text-sm text-muted-foreground pt-2">
          Already a customer? <Link to="/login" className="font-black text-nigeria-orange hover:underline" data-testid="to-login">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}

function AuthShell({ title, subtitle, children, testId }) {
  return (
    <div className="min-h-[80vh] grid lg:grid-cols-2" data-testid={testId}>
      <div className="hidden lg:block relative overflow-hidden bg-nigeria-dark">
        <div className="absolute inset-0 ankara-pattern opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-nigeria-dark via-nigeria-dark/90 to-transparent" />
        <img src="https://static.prod-images.emergentagent.com/jobs/50949266-3fc6-4e36-a0b9-e75b1e1a578a/images/59bb0bd914161174f67575629cea61a93a3c6066edee58574616f9b331e0f27a.png" alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="relative h-full flex flex-col justify-end p-12 text-white">
          <div className="text-nigeria-lime font-black text-sm uppercase tracking-widest mb-3">Brianna.app</div>
          <h2 className="font-display font-black text-4xl lg:text-5xl leading-tight">A taste of home,<br />one click away.</h2>
          <p className="mt-4 text-white/70">Join 12,000+ diasporans shopping authentic Nigerian staples every week.</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-full bg-nigeria-lime flex items-center justify-center font-black text-nigeria-dark">B</div>
            <span className="font-display font-black text-xl">Brianna.app</span>
          </Link>
          <h1 className="font-display font-black text-4xl text-nigeria-dark tracking-tight">{title}</h1>
          <p className="text-muted-foreground mt-2">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, type = "text", value, onChange, testId }) {
  return (
    <div>
      <Label className="text-xs font-black uppercase tracking-widest mb-2 block">{label}</Label>
      <div className="relative">
        <Icon className="w-4 h-4 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
        <Input required type={type} value={value} onChange={(e) => onChange(e.target.value)} className="pl-11 h-12 rounded-xl" data-testid={testId} />
      </div>
    </div>
  );
}

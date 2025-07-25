import { Card, CardContent } from "@/components/ui/card";
import { Eye, EyeOff, FileText, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import FiscatusIcon from "@/assets/logo_fiscatus.png";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useTheme } from "next-themes";

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { theme, setTheme } = useTheme();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [formSubmitted, setFormSubmitted] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    if (isLogin || acceptedTerms) {
      console.log("Form submitted:", { isLogin, formData });
    }
  };

  const isFormValid = () => {
    const hasRequiredFields = isLogin
      ? formData.email && formData.password
      : formData.fullName &&
        formData.email &&
        formData.password &&
        formData.confirmPassword;

    return hasRequiredFields && (isLogin || acceptedTerms);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-card shadow-2xl border-0 rounded-2xl">
        <CardContent className="p-0">
          <div className="grid lg:grid-cols-2 min-h-[600px]">
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <div className="flex justify-between items-center mb-8">
                <div></div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
              </div>

              <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {isLogin ? "Bem-vindo de volta" : "Criar conta"}
                </h1>
                <p className="text-muted-foreground">
                  {isLogin
                    ? "Entre na sua conta"
                    : "Digite seus dados para começar"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-foreground">
                      Nome completo
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      className="bg-background border-border rounded-md"
                      placeholder="Digite seu nome completo"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="bg-background border-border rounded-md"
                    placeholder="Digite seu email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">
                    Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className="bg-background border-border pr-10 rounded-md"
                      placeholder="Digite sua senha"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-foreground"
                    >
                      Confirmar senha
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          handleInputChange("confirmPassword", e.target.value)
                        }
                        className="bg-background border-border pr-10 rounded-md"
                        placeholder="Confirme sua senha"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {isLogin && (
                  <div className="flex justify-end">
                    <Button variant="link" className="p-0 h-auto text-primary">
                      Esqueceu a senha?
                    </Button>
                  </div>
                )}

                {!isLogin && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={acceptedTerms}
                      onCheckedChange={(checked) =>
                        setAcceptedTerms(checked === true)
                      }
                    />
                    <Label
                      htmlFor="terms"
                      className="text-sm text-muted-foreground"
                    >
                      Li e aceito a{" "}
                      <Button
                        variant="link"
                        className="p-0 h-auto text-primary"
                      >
                        política de privacidade
                      </Button>
                    </Label>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-gradient-brand hover:bg-gradient-brand-hover text-primary-foreground"
                  disabled={!isFormValid()}
                >
                  {isLogin ? "Entrar" : "Registrar"}
                </Button>

                {isLogin && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-border text-foreground flex items-center gap-2"
                  >
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Entrar com Google
                  </Button>
                )}

                <div className="text-center">
                  <p className="text-muted-foreground">
                    {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
                    <Button
                      variant="link"
                      className="p-0 h-auto text-primary"
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setFormData({
                          fullName: "",
                          email: "",
                          password: "",
                          confirmPassword: "",
                        });
                        setFormSubmitted(false);
                      }}
                    >
                      {isLogin ? "Cadastre-se" : "Entrar"}
                    </Button>
                  </p>
                </div>
              </form>
            </div>

            {/* Right side - Brand visual */}
            <div className="hidden lg:flex bg-gradient-to-br from-[#7F3FFF] via-[#4F8CFF] to-[#00E0FF] relative overflow-hidden items-center justify-center rounded-2xl">
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="relative z-10 text-center text-white">
                <div className="relative mb-8">
                  <div className="relative w-48 h-48 mx-auto">
                    
                    {/* Brain icon with glow effect */}
                    <div className="absolute inset-4 flex items-center justify-center">
                      <div className="relative">
                        <img
                          src={FiscatusIcon}
                          alt="Brain AI"
                          className="w-50 h-50 drop-shadow-2xl"
                        />
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <h2 className="text-4xl font-bold tracking-wide">FISCATUS</h2>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

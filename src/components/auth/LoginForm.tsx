import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { loginSchema } from '@/schemas/auth';
import { LoginFormData } from '@/types/auth';
import { useAuth } from '@/contexts/AuthContext';
import { AuthService, infoManager } from '@/services/auth';
import { useToast } from '@/hooks/use-toast';

interface LoginFormProps {
  onSwitchToSignup: () => void;
  onSwitchToOTP: (userType?: 'ADMIN' | 'CUSTOMER') => void;
}

export function LoginForm({ onSwitchToSignup, onSwitchToOTP }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [requiresTOTP, setRequiresTOTP] = useState(false);
  const { setLoading, setError, clearError, setUser, closeAuthModal } = useAuth();
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Reset TOTP requirement when user changes email or password
  const resetTOTPRequirement = () => {
    if (requiresTOTP) {
      setRequiresTOTP(false);
      form.setValue('totp', '');
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    try {
      clearError();
      setLoading(true);
      
      // Ensure all required fields are present
      const loginData: LoginFormData = {
        email: data.email!,
        password: data.password!,
        totp: data.totp,
      };
      
      const result = await AuthService.login(loginData);
      
      // Store user info in sessionStorage/localStorage based on user type
      if (result.user.userType === 'ADMIN') {
        infoManager.setAdminInfo(result.user);
      } else {
        infoManager.setCustomerInfo(result.user);
      }
      
      // Set user in auth context
      setUser(result.user);
      
      // Show success toast
      toast({
        title: "Login Successful",
        description: `Welcome back, ${result.user.name}!`,
      });
      
      // Close the auth modal
      closeAuthModal();
      
      // Handle successful login based on user type
      if (result.user.userType === 'ADMIN') {
        console.log('Admin login successful', result.user);
        window.location.href = '/admin';
      } else {
        console.log('Customer login successful', result.user);
        window.location.href = '/store';
      }
    } catch (error) {
      // Check if the error indicates TOTP is required
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      if (errorMessage.includes('Two-factor authentication code (TOTP) is required for admin users') || 
          errorMessage.includes('مطلوب رمز المصادقة الثنائية للمسؤولين')) {
        // Show TOTP field and don't show error message
        setRequiresTOTP(true);
        clearError();
      } else {
        // Show the error message using toast
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
        form.setValue('totp', '');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto min-h-[400px] flex flex-col">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Sign In</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        resetTOTPRequirement();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter your password"
                                {...field}
                                className="pr-10"
                                onChange={(e) => {
                                  field.onChange(e);
                                  resetTOTPRequirement();
                                }}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {requiresTOTP && (
                      <FormField
                        control={form.control}
                        name="totp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>TOTP Code</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                placeholder="000000"
                                maxLength={6}
                                className="text-center text-lg tracking-widest font-mono"
                                {...field}
                                onChange={(e) => {
                                  // Only allow numbers
                                  const value = e.target.value.replace(/\D/g, '');
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <p className="text-sm text-muted-foreground">
                              Please enter the 6-digit code from your authenticator app
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Button
              variant="link"
              className="p-0 h-auto font-normal"
              onClick={onSwitchToSignup}
            >
              Sign up
            </Button>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

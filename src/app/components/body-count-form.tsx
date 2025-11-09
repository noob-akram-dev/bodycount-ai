
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Flame, RefreshCw, Send } from "lucide-react";

import { getBodyCountAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  username: z.string().min(2, { message: "Username must be at least 2 characters." }),
});

export function BodyCountForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{bodyCount: number; datingSuggestion: string} | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    const actionResult = await getBodyCountAction(values);
    setIsLoading(false);

    if (actionResult.error) {
      toast({
        title: "Error",
        description: actionResult.error,
        variant: "destructive",
      });
    } else if (actionResult.bodyCount !== undefined && actionResult.datingSuggestion) {
      setResult({bodyCount: actionResult.bodyCount, datingSuggestion: actionResult.datingSuggestion});
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-2xl rounded-3xl border-4 border-primary/20">
      <CardHeader className="text-center pt-8">
        <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
          <Flame className="w-8 h-8" />
        </div>
        <CardTitle className="text-4xl font-bold font-headline italic">BodyCount AI</CardTitle>
        <CardDescription className="text-muted-foreground pt-1">
          Their dating history: short story or epic saga? Let our AI guess.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 min-h-[300px] flex flex-col items-center justify-center">
        {result ? (
          <div className="text-center space-y-4 animate-in fade-in-50 zoom-in-95 w-full">
            <p className="text-lg text-muted-foreground font-body">Original Body Count</p>
            <p className="text-8xl font-black text-primary font-headline tracking-tighter">
              {result.bodyCount}
            </p>
            <p className="text-sm text-muted-foreground italic px-4">
              &ldquo;{result.datingSuggestion}&rdquo;
            </p>
            <Button
              onClick={() => {
                setResult(null);
                form.reset();
              }}
              variant="outline"
              className="mt-4"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Another
            </Button>
          </div>
        ) : isLoading ? (
          <div className="text-center space-y-4 animate-in fade-in-50 w-full">
            <p className="text-lg text-muted-foreground font-body">Predicting...</p>
            <p className="text-8xl font-black text-primary/50 animate-pulse font-headline tracking-tighter">
              ??
            </p>
            <div className="h-10 mt-6" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="@username"
                        {...field}
                        className="h-14 text-center text-lg rounded-xl"
                      />
                    </FormControl>
                    <FormMessage className="text-center" />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full h-14 text-lg rounded-xl">
                <Send className="mr-2 h-5 w-5" />
                Predict
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <p className="text-xs text-muted-foreground text-center w-full">
          Disclaimer: Our proprietary algorithm delivers unparalleled accuracy in body count estimation. Trust the science.
        </p>
      </CardFooter>
    </Card>
  );
}

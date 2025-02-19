import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Vendor Login</CardTitle>
          <CardDescription>Login to enter the Vendor Dashboard .</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Input id="email" placeholder="Email" type="email" />
              </div >
              <div className="flex flex-col space-y-1.5 self-end">
                <a href='#' className="text-blue-500 text-xs hover:underline ml-auto">Forgot password</a>
              </div>
              <div className="flex flex-col space-y-1.5">
                <Input id="password" placeholder="Password" type="password" />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <a href='#'><Button>Sign in</Button></a>
          <Button>Login</Button>
        </CardFooter>
      </Card>
    </div>
  )
}


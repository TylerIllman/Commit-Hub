import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isTenantRoute = createRouteMatcher([
  "/organization-selector(.*)",
  "/orgid/(.*)",
]);

const isTenantAdminRoute = createRouteMatcher([
  "/orgId/(.*)/memberships",
  "/orgId/(.*)/domain",
]);

export default clerkMiddleware((auth, req) => {
  // Restrict admin routes to users with specific permissions
  if (isTenantAdminRoute(req)) {
    auth().protect((has) => {
      return (
        has({ permission: "org:sys_memberships:manage" }) ||
        has({ permission: "org:sys_domains_manage" })
      );
    });
  }
  // Restrict organization routes to signed in users
  if (isTenantRoute(req)) auth().protect();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, user } = useUserSession();

  if (to.path === "/auth/login") {
    return;
  }

  if (to.path !== "/onboarding" && user.value && !user.value.is_onboarded) {
    return navigateTo("/onboarding");
  }

  if (!loggedIn.value || !user.value) {
    return navigateTo("/auth/login");
  }
});

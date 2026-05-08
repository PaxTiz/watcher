export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, user } = useUserSession();

  if (to.path === "/auth/login") {
    return;
  }

  if (!loggedIn.value || !user.value) {
    return navigateTo("/auth/login");
  }
});

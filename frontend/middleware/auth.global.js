export default defineNuxtRouteMiddleware(async (to, from) => {
  const publicPages = ["/login", "/register"];

  const token = process.client ? localStorage.getItem("token") : null;

  if (publicPages.includes(to.path)) {
    if (token) {
      return navigateTo("/dashboard");
    }
    return;
  }

  if (!token) {
    return navigateTo("/login");
  }

  try {
    const config = useRuntimeConfig();

    await $fetch(`${config.public.apiBase}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return;
  } catch (err) {

    if (process.client) localStorage.removeItem("token");
    return navigateTo("/login");
  }
});

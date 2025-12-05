import axios from "axios";

export const useUser = () => {
  const user = ref(null);
  const loading = ref(true);

  const config = useRuntimeConfig();

  const fetchUser = async () => {
    try {
      if (process.client) {
        const token = localStorage.getItem("token");
        if (!token) return;

        const { data } = await axios.get(`${config.public.apiBase}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        user.value = data.data;
      }
    } catch (err) {
      console.log("ดึงข้อมูลไม่สำเร็จ", err);
    } finally {
      loading.value = false;
    }
  };

  return {
    user,
    loading,
    fetchUser,
  };
};

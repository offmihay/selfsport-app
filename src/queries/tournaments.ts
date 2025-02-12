import { useMutation, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { Tournament, TournamentBase, TournamentStatus } from "../types/tournament";
import { TournamentFormData } from "../components/tournaments/create/form/schema";
import Toast from "react-native-toast-message";
import useApi from "../api/useApi";
import { useTranslation } from "react-i18next";
import { TournamentQuery } from "../components/home/types";

export const getTournaments = (queryParams: Partial<TournamentQuery>) => {
  const { fetchData } = useApi();
  return useQuery({
    queryKey: ["tournaments", queryParams],
    queryFn: async () => {
      const response = await fetchData<any, TournamentBase[]>("/tournaments", { queryParams });
      return response.data;
    },
    initialData: [],
  });
};

export const getMyTournaments = (isFinished: boolean = false) => {
  const { fetchData } = useApi();
  const queryClient = useQueryClient();
  const cache = queryClient.getQueryData<TournamentBase[]>(["my-tournaments", isFinished]);

  return useQuery({
    queryKey: ["my-tournaments", isFinished],
    queryFn: async () => {
      const response = await fetchData<any, TournamentBase[]>("/tournaments/my", {
        queryParams: {
          finished: isFinished,
        },
      });
      return response.data;
    },
    refetchOnWindowFocus: true,
    enabled: !cache,
  });
};

export const registerTournament = () => {
  const queryClient = useQueryClient();
  const { fetchData } = useApi();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetchData<any, Tournament>(`/tournaments/${id}/register`, {
        method: "POST",
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["tournament", data.id], data);
      queryClient.setQueryData<Tournament[]>(["my-tournaments", false], (prev) => {
        if (prev) {
          const index = prev.findIndex((t) => t.id === data.id);
          if (index === -1) {
            return [data, ...prev];
          } else {
            return [...prev.slice(0, index), data, ...prev.slice(index + 1)];
          }
        }
        return [data];
      });
    },
    onError: (error) => {
      Toast.show({
        type: "errorToast",
        props: { text: error.message },
      });
    },
  });
};

export const leaveTournament = () => {
  const queryClient = useQueryClient();
  const { fetchData } = useApi();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetchData<any, Tournament>(`/tournaments/${id}/leave`, {
        method: "DELETE",
      });
      return response.data;
    },
    onError: (error) => {
      Toast.show({
        type: "errorToast",
        props: { text: error.message },
      });
    },
    onSuccess: (data) => {
      Toast.show({
        type: "successToast",
        props: { text: "U leaved this tournament" },
      });
      queryClient.setQueryData(["tournament", data.id], data);
      queryClient.setQueriesData<Tournament[]>(
        { queryKey: ["my-tournaments"] },
        (prev) => prev && prev.filter((t) => t.id !== data.id)
      );
    },
  });
};

export const getTournamentByID = (id: string): UseQueryResult<Tournament> => {
  const { fetchData } = useApi();

  return useQuery<Tournament>({
    queryKey: ["tournament", id],
    queryFn: async () => {
      const response = await fetchData<any, Tournament>(`/tournaments/${id}`);

      return response.data;
    },
    refetchOnMount: false,
  });
};

export const postTournament = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { fetchData } = useApi();
  return useMutation({
    mutationFn: async (data: TournamentFormData) => {
      const response = await fetchData<TournamentFormData, any>("/tournaments", {
        method: "POST",
        body: data,
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<Tournament[]>(["my-tournaments", false], (prev) =>
        prev ? [data, ...prev] : [data]
      );
      Toast.show({
        type: "successToast",
        props: { text: t("tournaments.create.successMessage") },
      });
    },
    onError: (error) => {
      Toast.show({
        type: "errorToast",
        props: { text: t("tournaments.create.errorMessage") },
      });
    },
  });
};

export const updateTournament = () => {
  const { fetchData } = useApi();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data, id }: { data: TournamentFormData; id: string }) => {
      const response = await fetchData<TournamentFormData, Tournament>(`/tournaments/${id}`, {
        method: "PUT",
        body: data,
      });
      return response.data;
    },
    onError: () => {
      Toast.show({
        type: "errorToast",
        props: { text: t("tournaments.edit.errorMessage") },
      });
    },
    onSuccess: (data, { id }) => {
      Toast.show({
        type: "successToast",
        props: { text: t("tournaments.edit.successMessage") },
      });
      const isFinished = !data.isActive || data.status === TournamentStatus.FINISHED;
      queryClient.setQueryData(["tournament", data.id], data);
      queryClient.setQueryData<Tournament[]>(["my-tournaments", isFinished], (prev) => {
        if (prev) {
          const index = prev.findIndex((t) => t.id === data.id);
          if (index === -1) {
            return [data, ...prev];
          } else {
            return [...prev.slice(0, index), data, ...prev.slice(index + 1)];
          }
        }
        return [data];
      });
      queryClient.setQueryData<Tournament[]>(["my-tournaments", !isFinished], (prev) => {
        if (prev) {
          return prev.filter((t) => t.id !== data.id);
        }
        return [];
      });
    },
  });
};

export const deleteTournament = () => {
  const { fetchData } = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetchData<TournamentFormData, { message: boolean }>(
        `/tournaments/${id}`,
        {
          method: "DELETE",
        }
      );
      return response.data;
    },
    onSuccess: (data, id) => {
      Toast.show({
        type: "successToast",
        props: { text: data.message },
      });
      queryClient.setQueriesData<Tournament[]>(
        { queryKey: ["my-tournaments"] },
        (prev) => prev && prev.filter((t) => t.id !== id)
      );
    },
    onError: (error) => {
      Toast.show({
        type: "errorToast",
        props: { text: error.message },
      });
    },
  });
};

export const removeUser = () => {
  const { fetchData } = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tournamentId,
      participantId,
    }: {
      tournamentId: string;
      participantId: string;
    }) => {
      const response = await fetchData<TournamentFormData, Tournament>(
        `/tournaments/${tournamentId}/user`,
        {
          queryParams: {
            participantId,
          },
          method: "PATCH",
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      Toast.show({
        type: "successToast",
        props: { text: "User was succesfully deleted." },
      });
      queryClient.setQueryData(["tournament", data.id], data);
    },
    onError: (error) => {
      Toast.show({
        type: "errorToast",
        props: { text: error.message },
      });
    },
  });
};

export const updateStatus = () => {
  const { fetchData } = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tournamentId, isActive }: { tournamentId: string; isActive: boolean }) => {
      const response = await fetchData<TournamentFormData, Tournament>(
        `/tournaments/${tournamentId}/status`,
        {
          queryParams: {
            isActive: isActive,
          },
          method: "PATCH",
        }
      );
      return response.data;
    },
    onSuccess: (data, { isActive }) => {
      Toast.show({
        type: "successToast",
        props: { text: "Status was successfully updated" },
      });
      queryClient.setQueryData(["tournament", data.id], data);
      queryClient.setQueryData<Tournament[]>(["my-tournaments", !isActive], (prev) => {
        if (prev) {
          const index = prev.findIndex((t) => t.id === data.id);
          if (index === -1) {
            return [data, ...prev];
          } else {
            return [...prev.slice(0, index), data, ...prev.slice(index + 1)];
          }
        }
        return [data];
      });
      queryClient.setQueryData<Tournament[]>(["my-tournaments", isActive], (prev) => {
        if (prev) {
          return prev.filter((t) => t.id !== data.id);
        }
        return [];
      });
    },
    onError: (error) => {
      Toast.show({
        type: "errorToast",
        props: { text: error.message },
      });
    },
  });
};

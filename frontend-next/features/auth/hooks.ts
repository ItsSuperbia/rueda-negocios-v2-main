"use client";

import { useMutation } from "@tanstack/react-query";
import { login, registerUser } from "@/features/auth/api";

export function useLoginMutation() {
  return useMutation({
    mutationFn: login
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: registerUser
  });
}

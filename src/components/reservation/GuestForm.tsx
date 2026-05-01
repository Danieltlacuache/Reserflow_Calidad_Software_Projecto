'use client';

import React, { useState } from 'react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export interface GuestData {
  name: string;
  email: string;
  phone: string;
}

interface GuestFormProps {
  onSubmit: (data: GuestData) => void;
  onBack: () => void;
}

export default function GuestForm({ onSubmit, onBack }: GuestFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'El nombre es obligatorio.';
    if (!email.trim()) {
      errs.email = 'El email es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Email inválido.';
    }
    if (!phone.trim()) {
      errs.phone = 'El teléfono es obligatorio.';
    } else if (phone.trim().length < 7) {
      errs.phone = 'El teléfono debe tener al menos 7 caracteres.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ name: name.trim(), email: email.trim(), phone: phone.trim() });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Datos del huésped</h3>
      <Input label="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
      <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
      <Input label="Teléfono" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} />
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onBack}>Atrás</Button>
        <Button type="submit">Continuar</Button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverPopup,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface DatePickerProps {
  value?: string | Date;
  onChange?: (val: string) => void;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
}

export function DatePicker({
  value,
  onChange,
  onDateChange,
  placeholder = "Selecione uma data",
  disabled = false,
  className,
  id,
  name,
  required,
}: DatePickerProps) {
  const [aberto, setAberto] = useState(false);

  const dataSelecionada: Date | undefined =
    typeof value === "string" && value
      ? parseISO(value)
      : value instanceof Date
        ? value
        : undefined;

  function handleSelect(data: Date | undefined) {
    if (data) {
      const ano = data.getFullYear();
      const mes = String(data.getMonth() + 1).padStart(2, "0");
      const dia = String(data.getDate()).padStart(2, "0");
      const isoFormat = `${ano}-${mes}-${dia}`;
      onChange?.(isoFormat);
      onDateChange?.(data);
    } else {
      onChange?.("");
      onDateChange?.(undefined);
    }
    setAberto(false);
  }

  const textoExibido = dataSelecionada
    ? format(dataSelecionada, "dd/MM/yyyy", { locale: ptBR })
    : null;

  return (
    <div className={cn("relative w-full", className)}>
      {name && (
        <input
          type="hidden"
          name={name}
          id={id}
          value={
            typeof value === "string"
              ? value
              : dataSelecionada
                ? format(dataSelecionada, "yyyy-MM-dd")
                : ""
          }
          required={required}
        />
      )}
      <Popover open={aberto} onOpenChange={setAberto}>
        <PopoverTrigger
          disabled={disabled}
          render={
            <Button
              type="button"
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal h-9 sm:h-8 px-3 gap-2",
                !dataSelecionada && "text-muted-foreground",
              )}
            />
          }
        >
          <CalendarIcon className="size-4 text-muted-foreground shrink-0" aria-hidden="true" />
          <span className="truncate">{textoExibido || placeholder}</span>
        </PopoverTrigger>
        <PopoverPopup align="start" className="w-auto p-0 z-50">
          <Calendar
            mode="single"
            selected={dataSelecionada}
            onSelect={handleSelect}
          />
        </PopoverPopup>
      </Popover>
    </div>
  );
}

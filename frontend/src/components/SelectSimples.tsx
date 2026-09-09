import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ItemStatus } from "@/lib/status";
import { cn } from "@/lib/utils";

export type ItemSelect = ItemStatus;

export function SelectSimples({
  itens,
  valor,
  aoMudar,
  placeholder,
  className,
  disabled,
}: {
  itens: readonly ItemSelect[];
  valor: string;
  aoMudar: (valor: string) => void;
  placeholder: string;
  className?: string;
  disabled?: boolean;
}) {
  const selecionado = itens.find((item) => item.value === valor) ?? null;
  const IconeSelecionado = selecionado?.icone;

  return (
    <Select
      disabled={disabled}
      items={[...itens]}
      value={selecionado}
      isItemEqualToValue={(a, b) => a.value === b.value}
      onValueChange={(item) => {
        if (item && typeof item === "object" && "value" in item) {
          aoMudar((item as ItemSelect).value);
        }
      }}
    >
      <SelectTrigger className={cn("w-full min-w-0", className)}>
        <div className="flex items-center gap-1.5 truncate">
          {IconeSelecionado ? (
            <IconeSelecionado
              className={cn("size-3.5 shrink-0", selecionado.corTexto)}
              aria-hidden="true"
            />
          ) : null}
          <SelectValue placeholder={placeholder}>
            {selecionado ? selecionado.label : undefined}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectPopup className="max-w-[calc(100vw-2rem)]">
        {itens.map((item) => {
          const Icone = item.icone;
          return (
            <SelectItem key={item.value} value={item}>
              <div className="flex items-center gap-1.5 truncate">
                {Icone ? (
                  <Icone
                    className={cn("size-3.5 shrink-0", item.corTexto)}
                    aria-hidden="true"
                  />
                ) : null}
                <span className="truncate">{item.label}</span>
              </div>
            </SelectItem>
          );
        })}
      </SelectPopup>
    </Select>
  );
}

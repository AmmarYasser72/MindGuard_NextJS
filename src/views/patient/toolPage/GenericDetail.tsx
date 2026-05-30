import { Modal } from "../../../components/common/Modal";
import Icon from "../../../components/common/Icon";
import { panelClass, primaryButtonClass, secondaryButtonClass } from "./constants";
import { detailNextStep } from "./helpers";
import type { ToolItem } from "./types";

type GenericDetailProps = {
  color: string;
  item: ToolItem;
  onClose: () => void;
  onFinish: () => void;
};

export default function GenericDetail({ item, color, onClose, onFinish }: GenericDetailProps) {
  const title = item.title || "Care item";
  const progressPercent = item.progress !== undefined ? Math.round(item.progress * 100) : null;

  return (
    <Modal title={title} onClose={onClose} actions={<><button type="button" className={secondaryButtonClass} onClick={onClose}>Close</button><button type="button" className={primaryButtonClass} onClick={onFinish}>Update</button></>}>
      <div className="grid gap-4">
        <section className={panelClass}>
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-lg" style={{ backgroundColor: `${color}1a` }}>
              <Icon name={item.icon || "target"} size={22} color={color} />
            </span>
            <span className="min-w-0">
              <strong className="block text-base font-black text-slate-950">{title}</strong>
              <small className="mt-1 block text-sm font-semibold leading-6 text-slate-500">{item.subtitle || item.description || item.meta || item.time}</small>
            </span>
          </div>
          {progressPercent !== null ? (
            <div className="mt-4">
              <div className="mb-2 flex justify-between text-xs font-black uppercase text-slate-400"><span>Progress</span><span>{progressPercent}%</span></div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100"><span className="block h-full rounded-full" style={{ width: `${progressPercent}%`, backgroundColor: item.color || color }} /></div>
            </div>
          ) : null}
        </section>
        <section className={panelClass}>
          <small className="text-xs font-black uppercase text-slate-400">Next step</small>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{detailNextStep(item)}</p>
        </section>
      </div>
    </Modal>
  );
}

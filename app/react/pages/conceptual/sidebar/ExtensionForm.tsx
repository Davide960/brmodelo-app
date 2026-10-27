import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import Dropdown from "../../../components/Dropdown";
import ElementColorPicker, { getCurrentColor } from "../../../components/ElementColorPicker";
import { SPECIALIZE_OPTIONS } from "./constants";

interface ExtensionFormProps {
	extensionType: string;
	cellView: any;
	onUpdate: (event: { type: string; value?: any }) => void;
}

// Funzione helper locale per tradurre solo graficamente le stringhe per l'utente
const getEnglishName = (typeStr: string): string => {
	if (typeStr === '(t, d)' || typeStr === '(t,d)' || typeStr === 'td') return 't.e.';
	if (typeStr === '(t, c)' || typeStr === '(t,c)' || typeStr === 'tc') return 't.o.';
	if (typeStr === '(p, d)' || typeStr === '(p,d)' || typeStr === 'pd') return 'p.e.';
	if (typeStr === '(p, c)' || typeStr === '(p,c)' || typeStr === 'pc') return 'p.o.';
	return typeStr;
};

const ExtensionForm: React.FC<ExtensionFormProps> = React.memo(({ extensionType, cellView, onUpdate }) => {
	const { t } = useTranslation(["common"]);
	const [currentType, setCurrentType] = useState(extensionType);

	useEffect(() => { setCurrentType(extensionType); }, [extensionType]);

	const handleEditExtension = useCallback((selected: { name: string; type: string }) => {
		setCurrentType(selected.type);
		
		// 1. Invia l'aggiornamento logico nativo al motore sotto il cofano
		onUpdate({ type: "editExtention", value: selected.type });
		
		// 2. Forza l'aggiornamento grafico immediato del testo in inglese sul foglio di disegno JointJS
		if (cellView && cellView.model && cellView.model.setText) {
			cellView.model.setText(selected.type, cellView);
		}
	}, [onUpdate, cellView]);

	const [selectedColor, setSelectedColor] = useState<string | null>(() => getCurrentColor(cellView));

	useEffect(() => { setSelectedColor(getCurrentColor(cellView)); }, [cellView]);

	const handleColorChange = useCallback((hex: string) => {
		if (cellView && cellView.model && cellView.model.setColor) {
			cellView.model.setColor(hex);
			setSelectedColor(hex.toLowerCase());
		}
	}, [cellView]);

	return (
		<>
			<div className="form-group clearfix">
				<label>{t("Edit")}</label>
				<Dropdown
					onSelect={handleEditExtension}
					// Modificato: il campo 'name' viene mappato in inglese per l'utente, mentre il motore legge 'type' nativo
					selected={{ name: getEnglishName(currentType), type: currentType }}
					options={SPECIALIZE_OPTIONS}
				/>
			</div>

			<ElementColorPicker onColorChange={handleColorChange} selectedColor={selectedColor} />
		</>
	);
});

ExtensionForm.displayName = "ExtensionForm";

export default ExtensionForm;

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

// Danh sách 34 tỉnh/thành và phường/xã theo đơn vị hành chính mới (từ 01/07/2025, không còn quận/huyện).
// File public/data/vn-units.json dạng [[tên tỉnh, [tên phường/xã...]], ...] – chỉ tải khi mở trang thanh toán.
let unitsPromise = null;
const loadUnits = () => {
  unitsPromise ??= fetch('/data/vn-units.json')
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Không tải được danh sách địa chỉ'))))
    .catch((err) => {
      unitsPromise = null; // lần sau thử tải lại
      throw err;
    });
  return unitsPromise;
};

const fieldClass = (error) =>
  `w-full text-xs p-2.5 border rounded-lg outline-none bg-white ${error ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-amber-400'}`;

function SelectBox({ value, onChange, disabled, error, children }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={`${fieldClass(error)} appearance-none pr-8 disabled:bg-gray-50 disabled:text-gray-400`}>
        {children}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

// value: { province, ward, street }; errors: { province?, ward?, street? }
export default function AddressPicker({ value, onChange, errors = {} }) {
  const [units, setUnits] = useState(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    loadUnits().then(setUnits).catch((err) => setLoadError(err.message));
  }, []);

  const wards = units?.find(([name]) => name === value.province)?.[1] || [];
  const set = (patch) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div>
          <SelectBox value={value.province} onChange={(province) => set({ province, ward: '' })} disabled={!units} error={errors.province}>
            <option value="">{units ? 'Chọn Tỉnh / Thành phố *' : loadError || 'Đang tải danh sách…'}</option>
            {units?.map(([name]) => <option key={name} value={name}>{name}</option>)}
          </SelectBox>
          {errors.province && <p className="text-[11px] text-red-600 mt-1">{errors.province}</p>}
        </div>
        <div>
          <SelectBox value={value.ward} onChange={(ward) => set({ ward })} disabled={!value.province} error={errors.ward}>
            <option value="">{value.province ? 'Chọn Phường / Xã *' : 'Chọn Tỉnh / Thành phố trước'}</option>
            {wards.map((name) => <option key={name} value={name}>{name}</option>)}
          </SelectBox>
          {errors.ward && <p className="text-[11px] text-red-600 mt-1">{errors.ward}</p>}
        </div>
      </div>
      <div>
        <input
          type="text"
          autoComplete="street-address"
          placeholder="Số nhà, tên đường (VD: 12 Nguyễn Xí) *"
          value={value.street}
          onChange={(e) => set({ street: e.target.value })}
          className={fieldClass(errors.street)}
        />
        {errors.street && <p className="text-[11px] text-red-600 mt-1">{errors.street}</p>}
      </div>
    </div>
  );
}

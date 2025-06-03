export default function EditableProfileField({ label, value, isEditing, onChange, type = 'text'}) {
  return (
    <div>
      <label>{label}</label>
      {isEditing ? (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} />
      ) : (
        <p>{value}</p>
      )}
    </div>
  );
}
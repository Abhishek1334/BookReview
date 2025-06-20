import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const FormField = ({ 
  id, 
  name, 
  type = "text", 
  value, 
  onChange, 
  placeholder, 
  autoComplete,
  error,
  label,
  required = false,
  icon: Icon,
  className = ""
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`transition-all ${Icon ? 'pl-10' : ''} ${error ? 'border-destructive focus-visible:ring-destructive' : ''} ${className}`}
        />
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        )}
      </div>
      {error && (
        <p className="text-xs text-destructive mt-1">{error}</p>
      )}
    </div>
  );
};

export default FormField; 
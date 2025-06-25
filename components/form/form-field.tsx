"use client"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { useFormContext } from "react-hook-form"

interface FormFieldProps {
  name: string
  label?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox'
  placeholder?: string
  options?: Array<{ value: string; label: string }>
  className?: string
  required?: boolean
  description?: string
}

export function FormField({
  name,
  label,
  type = 'text',
  placeholder,
  options = [],
  className,
  required = false,
  description,
}: FormFieldProps) {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext()

  const error = errors[name]
  const value = watch(name)

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            {...register(name)}
            placeholder={placeholder}
            className={cn(error && "border-red-500", className)}
          />
        )
      
      case 'select':
        return (
          <Select onValueChange={(value) => setValue(name, value)} value={value}>
            <SelectTrigger className={cn(error && "border-red-500", className)}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      
      case 'radio':
        return (
          <RadioGroup
            onValueChange={(value) => setValue(name, value)}
            value={value}
            className={cn("flex flex-col space-y-2", className)}
          >
            {options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
                <Label htmlFor={`${name}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        )
      
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={name}
              checked={value || false}
              onCheckedChange={(checked) => setValue(name, checked)}
              className={cn(error && "border-red-500")}
            />
            <Label htmlFor={name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {label}
            </Label>
          </div>
        )
      
      default:
        return (
          <Input
            {...register(name)}
            type={type}
            placeholder={placeholder}
            className={cn(error && "border-red-500", className)}
          />
        )
    }
  }

  if (type === 'checkbox') {
    return (
      <div className="space-y-2">
        {renderInput()}
        {description && (
          <p className="text-sm text-gray-600">{description}</p>
        )}
        {error && (
          <p className="text-sm text-red-500">
            {error.message as string}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={name} className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      {renderInput()}
      {description && (
        <p className="text-sm text-gray-600">{description}</p>
      )}
      {error && (
        <p className="text-sm text-red-500">
          {error.message as string}
        </p>
      )}
    </div>
  )
} 
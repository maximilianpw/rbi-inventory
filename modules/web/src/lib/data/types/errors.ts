export interface ConflictError {
  message: string
}

export interface NotFoundError {
  message: string
}

export interface ValidationError {
  message: string
  field?: string
}

export interface UnauthorizedError {
  message: string
}

export interface ForbiddenError {
  message: string
}

export interface InternalError {
  message: string
}

export interface BadRequestError {
  message: string
}

export interface TimeoutError {
  message: string
  operation?: string
  duration?: number // milliseconds
}

// Union type for all domain errors
export type DomainError =
  | ConflictError
  | NotFoundError
  | ValidationError
  | UnauthorizedError
  | ForbiddenError
  | InternalError
  | BadRequestError
  | TimeoutError

// Typed error classes extending Error
export class ConflictException extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConflictException'
  }
}

export class NotFoundException extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NotFoundException'
  }
}

export class ValidationException extends Error {
  field?: string

  constructor(message: string, field?: string) {
    super(field ? `validation error on ${field}: ${message}` : message)
    this.name = 'ValidationException'
    this.field = field
  }
}

export class UnauthorizedException extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UnauthorizedException'
  }
}

export class ForbiddenException extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ForbiddenException'
  }
}

export class InternalException extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InternalException'
  }
}

export class BadRequestException extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BadRequestException'
  }
}

export class TimeoutException extends Error {
  operation?: string
  duration?: number

  constructor(message: string, operation?: string, duration?: number) {
    const errorMessage =
      operation && duration !== undefined
        ? `operation timeout: ${operation} after ${duration}ms (${message})`
        : message
    super(errorMessage)
    this.name = 'TimeoutException'
    this.operation = operation
    this.duration = duration
  }
}

// Union type for all exception classes
export type DomainException =
  | ConflictException
  | NotFoundException
  | ValidationException
  | UnauthorizedException
  | ForbiddenException
  | InternalException
  | BadRequestException
  | TimeoutException

// Type guards for error checking
export function isConflict(err: unknown): err is ConflictException {
  return err instanceof ConflictException
}

export function isNotFound(err: unknown): err is NotFoundException {
  return err instanceof NotFoundException
}

export function isValidation(err: unknown): err is ValidationException {
  return err instanceof ValidationException
}

export function isUnauthorized(err: unknown): err is UnauthorizedException {
  return err instanceof UnauthorizedException
}

export function isForbidden(err: unknown): err is ForbiddenException {
  return err instanceof ForbiddenException
}

export function isInternal(err: unknown): err is InternalException {
  return err instanceof InternalException
}

export function isBadRequest(err: unknown): err is BadRequestException {
  return err instanceof BadRequestException
}

export function isTimeout(err: unknown): err is TimeoutException {
  return err instanceof TimeoutException
}

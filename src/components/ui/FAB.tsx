"use client"

import React, { FC, PropsWithChildren, useEffect, useState } from "react"

import { useGetState } from "~/hooks/useGetState"
import { cn } from "~/lib/utils"

export interface FABConfig {
  id: string
  icon: JSX.Element
  onClick: () => void
}

class FABStatic {
  private setState: React.Dispatch<React.SetStateAction<FABConfig[]>> | null =
    null
  register(setter: any) {
    this.setState = setter
  }
  destroy() {
    this.setState = null
  }

  add(fabConfig: FABConfig) {
    if (!this.setState) return

    const id = fabConfig.id

    this.setState((state) => {
      if (state.find((config) => config.id === id)) return state
      return [...state, fabConfig]
    })

    return () => {
      this.remove(fabConfig.id)
    }
  }

  remove(id: string) {
    if (!this.setState) return
    this.setState((state) => {
      return state.filter((config) => config.id !== id)
    })
  }
}

const fab = new FABStatic()

export const useFAB = (fabConfig: FABConfig) => {
  useEffect(() => {
    return fab.add(fabConfig)
  }, [])
}

export const FABBase: FC<
  PropsWithChildren<
    {
      id: string
      show?: boolean
      children: JSX.Element
    } & React.DetailedHTMLProps<
      React.ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >
  >
> = (props) => {
  const { children, id, show = true, ...extra } = props
  const { className, onTransitionEnd, ...rest } = extra

  const [mounted, setMounted] = useState(true)
  const [appearTransition, setAppearTransition] = useState(false)
  const getMounted = useGetState(mounted)
  const handleTransitionEnd: React.TransitionEventHandler<HTMLButtonElement> = (
    e,
  ) => {
    onTransitionEnd?.(e)

    !show && setMounted(false)
  }

  useEffect(() => {
    if (show && !getMounted()) {
      setAppearTransition(true)
      setMounted(true)

      requestAnimationFrame(() => {
        setAppearTransition(false)
      })
    }
  }, [show])

  return (
    <button
      className={cn(
        "bg-white inline-flex w-8 h-8 mt-2 items-center justify-center rounded-md border border-accent text-accent opacity-50 hover:opacity-100 focus:opacity-100 focus:outline-none transition-all duration-300",
        (!show || appearTransition) && "translate-x-[60px]",
        !mounted && "hidden",
        className,
      )}
      onTransitionEnd={handleTransitionEnd}
      {...rest}
    >
      {children}
    </button>
  )
}

export const FABContainer: FC<{
  children: JSX.Element | JSX.Element[]
}> = (props) => {
  const [fabConfig, setFabConfig] = useState<FABConfig[]>([])
  useEffect(() => {
    fab.register(setFabConfig)
    return () => {
      fab.destroy()
    }
  }, [])

  const [serverSide, setServerSide] = useState(true)

  useEffect(() => {
    setServerSide(false)
  }, [])

  if (serverSide) return null

  return (
    <div
      className={cn(
        "z-[9] right-4 bottom-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] fixed font-lg flex flex-col",
      )}
    >
      {fabConfig.map((config) => {
        const { id, onClick, icon } = config
        return (
          <FABBase id={id} onClick={onClick} key={id}>
            {icon}
          </FABBase>
        )
      })}
      {props.children}
    </div>
  )
}

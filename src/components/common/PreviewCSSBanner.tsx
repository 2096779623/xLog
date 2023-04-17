import { useTranslation } from "next-i18next"
import { UniLink } from "~/components/ui/UniLink"
import { useRouter } from "next/router"
import { Fragment, useEffect, useState } from "react"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { Transition } from "@headlessui/react"

// https://tailwindui.com/components/marketing/elements/banners
interface DecorationBackgroundPart {
  diffClass: string
}
const DecorationBackgroundPart = ({ diffClass }: DecorationBackgroundPart) => (
  <div
    className={`absolute h-full overflow-hidden top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl ${diffClass}`}
    aria-hidden="true"
  >
    <div
      className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-[#ff80b5] to-[#9089fc] opacity-30"
      style={{
        clipPath:
          "polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)",
      }}
    />
  </div>
)

const DecorationBackground = () => (
  <>
    <DecorationBackgroundPart diffClass={"left-[max(-7rem,calc(50%-52rem))]"} />
    <DecorationBackgroundPart diffClass={"left-[max(45rem,calc(50%+8rem))]"} />
  </>
)

const BannerBody = () => {
  const router = useRouter()

  const subdomain = router.query.subdomain as string

  const { t } = useTranslation("common")

  return (
    <div className="flex flex-col flex-wrap gap-x-4 gap-y-2">
      <h3 className="text-lg font-semibold self-start">
        {t("CSS Preview Mode")}
      </h3>
      <p className="text-sm leading-6 text-gray-900 self-center">
        {t("You are under CSS Preview mode. Don't forget to save them!")}
      </p>
      <UniLink
        href={`/dashboard/${subdomain}/settings/css`}
        className="self-end rounded-lg bg-gray-900 px-3.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 transition-colors"
      >
        {t("Back to Dashboard")}
      </UniLink>
    </div>
  )
}

// https://github.com/tailwindlabs/tailwindcss/discussions/2567#discussioncomment-99038
interface GradientBeakerProps {
  className?: string
}
const GradientBeaker = ({ className }: GradientBeakerProps) => (
  <svg
    className={className}
    fill="none"
    stroke="url(#grad-beaker)"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="grad-beaker" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop
          offset="0%"
          style={{
            stopColor: "#b794f4",
            stopOpacity: 1,
          }}
        />
        <stop
          offset="50%"
          style={{
            stopColor: "#ed64a6",
            stopOpacity: 1,
          }}
        />
        <stop
          offset="100%"
          style={{
            stopColor: "#f56565",
            stopOpacity: 1,
          }}
        />
      </linearGradient>
    </defs>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
    ></path>
  </svg>
)

interface StateToggleButtonProps {
  isClosed: boolean
  setClosed: (state: boolean) => void
}
const StateToggleButton = ({ isClosed, setClosed }: StateToggleButtonProps) => (
  <button
    className="absolute right-0 -bottom-8 w-8 h-8 bg-white rounded-bl-lg flex items-center justify-center"
    onClick={() => setClosed(!isClosed)}
  >
    {isClosed ? (
      <GradientBeaker className={"w-5 h-5"} />
    ) : (
      <XMarkIcon className={"w-5 h-5"} />
    )}
  </button>
)

const PreviewCSSBanner = () => {
  const [isClosed, setClosed] = useState<boolean>(true)

  useEffect(() => {
    setClosed(false)
  }, [])

  return (
    <div>
      <Transition show={!isClosed} as={Fragment}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="z-20 fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={() => setClosed(true)}
          />
        </Transition.Child>
      </Transition>
      <div
        className={`fixed w-full z-20 isolate flex items-center gap-6 bg-gray-50 px-6 py-6 h-36 sm:px-3.5 flex-col transition-all duration-500 ease-in-out ${
          isClosed ? "-top-36" : "top-0"
        }`}
      >
        <DecorationBackground />
        <BannerBody />
        <StateToggleButton isClosed={isClosed} setClosed={setClosed} />
      </div>
    </div>
  )
}

export default PreviewCSSBanner

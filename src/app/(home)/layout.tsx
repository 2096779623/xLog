import { Hydrate, dehydrate } from "@tanstack/react-query"

import { ConnectButton } from "~/components/common/ConnectButton"
import { DarkModeSwitch } from "~/components/common/DarkModeSwitch"
import { Logo } from "~/components/common/Logo"
import HomeTabs from "~/components/home/HomeTabs"
import { UniLink } from "~/components/ui/UniLink"
import { APP_NAME, DISCORD_LINK, GITHUB_LINK, TWITTER_LINK } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import getQueryClient from "~/lib/query-client"
import { prefetchGetShowcase } from "~/queries/home.server"

export default async function HomeLayout({
  children,
}: {
  children?: React.ReactNode
}) {
  const queryClient = getQueryClient()
  await prefetchGetShowcase(queryClient)
  const dehydratedState = dehydrate(queryClient)

  return (
    <Hydrate state={dehydratedState}>
      <header className="py-5 fixed w-full top-0 bg-white z-10">
        <div className="max-w-screen-lg px-5 mx-auto flex justify-between items-center">
          <UniLink
            href="/"
            className="text-2xl font-extrabold flex items-center"
          >
            <div className="inline-block w-9 h-9 mr-3">
              <Logo type="lottie" width={36} height={36} autoplay={false} />
            </div>
            xLog
          </UniLink>
          <div className="space-x-14 text-zinc-500 flex">
            <HomeTabs />
            <ConnectButton size="base" variantColor="black" />
          </div>
        </div>
      </header>
      {children}
      <footer className="mt-10 font-medium border-t">
        <div className="max-w-screen-lg px-5 py-14 mx-auto flex justify-between">
          <span className="text-zinc-700 ml-2 inline-flex items-center space-x-5 align-middle">
            {GITHUB_LINK && (
              <UniLink className="flex items-center" href={GITHUB_LINK}>
                <span className="inline-block icon-[mingcute--github-fill] text-2xl hover:text-accent"></span>
              </UniLink>
            )}
            {DISCORD_LINK && (
              <UniLink className="flex items-center" href={DISCORD_LINK}>
                <span className="inline-block icon-[mingcute--discord-fill] text-2xl hover:text-accent"></span>
              </UniLink>
            )}
            {TWITTER_LINK && (
              <UniLink className="flex items-center" href={TWITTER_LINK}>
                <span className="inline-block icon-[mingcute--twitter-fill] text-2xl hover:text-accent"></span>
              </UniLink>
            )}
          </span>
          <span className="inline-flex items-center space-x-4">
            <DarkModeSwitch />
            <span>
              &copy;{" "}
              <UniLink
                href={getSiteLink({
                  subdomain: "xlog",
                })}
                className="hover:text-accent"
              >
                {APP_NAME}
              </UniLink>
            </span>
          </span>
        </div>
      </footer>
    </Hydrate>
  )
}

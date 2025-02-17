"use client"

import equal from "fast-deep-equal"
import { nanoid } from "nanoid"
import { useParams } from "next/navigation"
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { ReactSortable } from "react-sortablejs"

import { SettingsLayout } from "~/components/dashboard/SettingsLayout"
import { Platform } from "~/components/site/Platform"
import { Button } from "~/components/ui/Button"
import { Input } from "~/components/ui/Input"
import { UniLink } from "~/components/ui/UniLink"
import { Trans, useTranslation } from "~/lib/i18n/client"
import { useGetSite, useUpdateSite } from "~/queries/site"

type Item = {
  identity: string
  platform: string
  url?: string | undefined
} & {
  id: string
}

type UpdateItem = (id: string, newItem: Partial<Item>) => void

type RemoveItem = (id: string) => void

const SortableNavigationItem: React.FC<{
  item: Item
  updateItem: UpdateItem
  removeItem: RemoveItem
}> = ({ item, updateItem, removeItem }) => {
  const { t } = useTranslation("dashboard")
  return (
    <div className="flex space-x-5 border-b p-5 bg-zinc-50 last:border-0">
      <div>
        <button
          type="button"
          className="drag-handle cursor-grab -mt-1 text-zinc-400 rounded-lg h-8 w-6 flex items-center justify-center hover:text-zinc-800 hover:bg-zinc-200"
        >
          <i className="icon-[mingcute--dot-grid-fill]" />
        </button>
      </div>
      <Input
        label={t("Platform") || ""}
        required
        id={`${item.id}-platform`}
        value={item.platform}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          updateItem(item.id, { platform: e.target.value })
        }
      />
      <Input
        label="Identity"
        required
        id={`${item.id}-identity`}
        type="text"
        value={item.identity}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          updateItem(item.id, { identity: e.target.value })
        }
      />
      <div className="flex items-end pb-2">
        <Platform platform={item.platform} username={item.identity}></Platform>
      </div>
      <div className="flex items-end relative -top-[5px]">
        <Button onClick={() => removeItem(item.id)} variantColor="red">
          {t("Remove")}
        </Button>
      </div>
    </div>
  )
}

export default function SiteSettingsNavigationPage() {
  const params = useParams()
  const subdomain = params?.subdomain as string

  const updateSite = useUpdateSite()
  const site = useGetSite(subdomain)
  const { t } = useTranslation("dashboard")

  const [items, setItems] = useState<Item[]>([])

  const itemsModified = useMemo(() => {
    if (!site.isSuccess) return false
    return !equal(items, site.data?.metadata?.content?.connected_accounts)
  }, [items, site.data, site.isSuccess])

  const updateItem: UpdateItem = (id, newItem) => {
    setItems((items) => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, ...newItem }
        }
        return item
      })
    })
  }

  const newEmptyItem = () => {
    setItems((items) => [
      ...items,
      { id: nanoid(), platform: "", identity: "" },
    ])
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (site.data?.handle) {
      updateSite.mutate({
        site: site.data?.handle,
        connected_accounts: items.map(({ id, ...item }) => item),
      })
    }
  }

  useEffect(() => {
    if (updateSite.isSuccess) {
      if (updateSite.data?.code === 0) {
        toast.success("Saved")
      } else {
        toast.error("Failed to save" + ": " + updateSite.data.message)
      }
    } else if (updateSite.isError) {
      toast.error("Failed to save")
    }
  }, [updateSite.isSuccess, updateSite.isError])

  const removeItem: RemoveItem = (id) => {
    setItems((items) => items.filter((item) => item.id !== id))
  }

  const [hasSet, setHasSet] = useState(false)
  useEffect(() => {
    if (site.data?.metadata?.content?.connected_accounts && !hasSet) {
      setHasSet(true)
      setItems(
        site.data?.metadata?.content?.connected_accounts.map((item) => {
          const match = item.match(/:\/\/account:(.*)@(.*)/)
          if (match) {
            return {
              id: nanoid(),
              identity: match[1],
              platform: match[2],
            }
          } else {
            return {
              id: nanoid(),
              identity: item,
              platform: "",
            }
          }
        }),
      )
    }
  }, [site.data?.metadata?.content?.connected_accounts, hasSet])

  return (
    <SettingsLayout title="Site Settings">
      <div className="p-5 text-zinc-500 bg-zinc-50 mb-5 rounded-lg text-xs space-y-2">
        <p className="text-zinc-800 text-sm font-bold">{t("Tips")}:</p>
        <p>
          <span className="text-zinc-800">{t("social tips.p1")}</span>
        </p>
        <p>
          <span className="text-zinc-800">
            <Trans ns="dashboard" i18nKey="social tips.p2">
              We support{" "}
              <UniLink
                href="https://github.com/Crossbell-Box/xLog/blob/dev/src/components/site/Platform.tsx#L7"
                className="underline"
              >
                these platforms
              </UniLink>{" "}
              with automatic display of logos and links, other platforms will
              display a default logo. Please feel free to submit an issue or pr
              to us to support more platforms.
            </Trans>
          </span>
        </p>
        <p>
          <span className="text-zinc-800">
            <Trans ns="dashboard" i18nKey="social tips.p3">
              You can also connect to Twitter, Telegram Channel, Medium,
              Substack and more and automatically sync content on{" "}
              <UniLink href="https://xsync.app/" className="underline">
                xSync
              </UniLink>
              . When you have set up the sync there, it will also show here.
            </Trans>
          </span>
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="bg-zinc-50 rounded-lg overflow-auto">
          {items.length === 0 && (
            <div className="text-center text-zinc-500 p-5">
              No navigation items yet
            </div>
          )}
          <ReactSortable list={items} setList={setItems} handle=".drag-handle">
            {items.map((item) => {
              return (
                <SortableNavigationItem
                  key={item.id}
                  item={item}
                  updateItem={updateItem}
                  removeItem={removeItem}
                />
              )
            })}
            <style jsx global>{`
              .sortable-ghost {
                opacity: 0.4;
              }
            `}</style>
          </ReactSortable>
        </div>
        <div className="border-t pt-5 mt-10 space-x-3 flex items-center">
          <Button
            type="submit"
            isLoading={updateSite.isLoading}
            isDisabled={!itemsModified}
          >
            {t("Save")}
          </Button>
          <Button variant="secondary" onClick={newEmptyItem}>
            {t("New Item")}
          </Button>
        </div>
      </form>
    </SettingsLayout>
  )
}

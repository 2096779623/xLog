"use client"

import { useParams } from "next/navigation"
import { Virtuoso } from "react-virtuoso"

import { CommentItem } from "~/components/common/CommentItem"
import { DashboardMain } from "~/components/dashboard/DashboardMain"
import { UniLink } from "~/components/ui/UniLink"
import { getSiteLink } from "~/lib/helpers"
import { Trans, useTranslation } from "~/lib/i18n/client"
import { useGetCommentsBySite, useGetSite } from "~/queries/site"

export default function CommentsPage() {
  const params = useParams()
  const subdomain = params?.subdomain as string
  const { t } = useTranslation("dashboard")

  const site = useGetSite(subdomain)

  const comments = useGetCommentsBySite({
    characterId: site.data?.characterId,
  })

  const feedUrl =
    getSiteLink({
      subdomain: subdomain,
    }) + "/feed/comments"

  return (
    <DashboardMain title="Comments">
      <div className="min-w-[270px] max-w-screen-lg">
        <div className="text-sm text-zinc-500 leading-relaxed">
          <p>
            {t(
              "You can subscribe to comments through an RSS reader to receive timely reminders.",
            )}
          </p>
          <p>
            {t("Subscription address:")}{" "}
            <UniLink className="text-accent" href={feedUrl} target="_blank">
              {feedUrl}
            </UniLink>
          </p>
        </div>
        <div className="xlog-comment">
          <div className="prose space-y-4 pt-4">
            <Virtuoso
              className="xlog-comment-list"
              useWindowScroll
              data={comments.data?.pages}
              endReached={() =>
                comments.hasNextPage && comments.fetchNextPage()
              }
              components={{
                Footer: comments.isLoading ? Loader : undefined,
              }}
              itemContent={(_, p) =>
                p?.list?.map((comment, idx) => {
                  const type = comment.toNote?.metadata?.content?.tags?.[0]
                  let toTitle
                  if (type === "post" || type === "page") {
                    toTitle = comment.toNote?.metadata?.content?.title
                  } else {
                    if (
                      (comment.toNote?.metadata?.content?.content?.length ||
                        0) > 30
                    ) {
                      toTitle =
                        comment.toNote?.metadata?.content?.content?.slice(
                          0,
                          30,
                        ) + "..."
                    } else {
                      toTitle = comment.toNote?.metadata?.content?.content
                    }
                  }
                  const name =
                    comment?.character?.metadata?.content?.name ||
                    `@${comment?.character?.handle}`

                  return (
                    <div key={comment.transactionHash} className="mt-6">
                      <div>
                        {name}{" "}
                        <Trans
                          i18nKey="comment on your"
                          values={{
                            type: t(type || "", {
                              ns: "common",
                            }),
                            toTitle,
                          }}
                          defaults="commented on your {{type}} <tolink>{{toTitle}}</tolink>"
                          components={{
                            tolink: (
                              <UniLink
                                href={`/api/redirection?characterId=${comment.characterId}&noteId=${comment.noteId}`}
                                target="_blank"
                              >
                                .
                              </UniLink>
                            ),
                          }}
                          ns="dashboard"
                        />
                        :
                      </div>
                      <CommentItem
                        className="mt-6"
                        comment={comment}
                        depth={0}
                      />
                    </div>
                  )
                })
              }
            ></Virtuoso>
          </div>
        </div>
      </div>
    </DashboardMain>
  )
}

const Loader = () => {
  const { t } = useTranslation("common")
  return (
    <div
      className="relative mt-4 w-full text-sm text-center py-4"
      key={"loading"}
    >
      {t("Loading")}...
    </div>
  )
}

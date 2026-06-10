"use client"

import { MatchLineupsTab } from "@/components/match/match-lineups-tab"
import { CommentThread } from "@/components/comment/comment-thread"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { FixtureWithTeams } from "@/lib/catalog/types"
import type { MatchDetail } from "@/lib/match/types"
import type { CommentsPageData } from "@/lib/comment/queries"
import type { MatchLineupPlayer } from "@/lib/match/types"
import Link from "next/link"

import { Button } from "@/components/ui/button"

type MatchPageTabsProps = {
  fixture: FixtureWithTeams
  detail: MatchDetail
  canRate: boolean
  ratingsLocked: boolean
  isLoggedIn: boolean
  commentsPage?: CommentsPageData
  currentUserId: string | null
  errorMessage: string | null
  onRateAll: () => void
  onPlayerClick: (player: MatchLineupPlayer) => void
}

export function MatchPageTabs({
  fixture,
  detail,
  canRate,
  ratingsLocked,
  isLoggedIn,
  commentsPage,
  currentUserId,
  errorMessage,
  onRateAll,
  onPlayerClick,
}: MatchPageTabsProps) {
  return (
    <Tabs defaultValue="lineups" className="w-full">
      <TabsList variant="line" className="mb-6 w-full justify-start rounded-none border-b border-border bg-transparent p-0">
        <TabsTrigger
          value="lineups"
          className="flex-1 after:bg-primary data-active:text-primary sm:flex-none"
        >
          Lineups
        </TabsTrigger>
        <TabsTrigger
          value="overview"
          className="flex-1 after:bg-primary data-active:text-primary sm:flex-none"
        >
          Comments
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="mt-0">
        {canRate && detail.rateableQueue.length > 0 && (
          <Button type="button" className="mb-4 w-full" onClick={onRateAll}>
            Rate all players
          </Button>
        )}

        {!isLoggedIn && (
          <p className="mb-4 text-center text-sm text-muted-foreground">
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>{" "}
            to rate performances.
          </p>
        )}

        {isLoggedIn && !detail.ratingsUnlocked && (
          <p className="mb-4 text-center text-sm text-muted-foreground">
            Ratings unlock when the match finishes.
          </p>
        )}

        {errorMessage && (
          <p className="mb-4 text-center text-sm text-destructive" role="alert">
            {errorMessage}
          </p>
        )}

        {commentsPage && (
          <CommentThread
            initialComments={commentsPage.comments}
            initialUserVotes={commentsPage.userVotes}
            totalParentCount={commentsPage.totalParentCount}
            initialParentHasMore={commentsPage.parentHasMore}
            initialParentNextCursor={commentsPage.parentNextCursor}
            initialReplyPagination={commentsPage.replyPagination}
            initialSort={commentsPage.initialSort}
            targetType="match"
            targetId={fixture.id}
            isLoggedIn={isLoggedIn}
            currentUserId={currentUserId}
          />
        )}

        <p className="body-sm mt-6 text-center">
          <Link href="/world-cup" className="text-primary underline-offset-4 hover:underline">
            Back to World Cup
          </Link>
        </p>
      </TabsContent>

      <TabsContent value="lineups" className="mt-0">
        {errorMessage && (
          <p className="mb-4 text-center text-sm text-destructive" role="alert">
            {errorMessage}
          </p>
        )}

        <MatchLineupsTab
          fixture={fixture}
          detail={detail}
          canRate={canRate}
          ratingsLocked={ratingsLocked}
          onPlayerClick={onPlayerClick}
        />
      </TabsContent>
    </Tabs>
  )
}

import MetaTags from '@components/Common/MetaTags';
import NFTFeed from '@components/NFT/NFTFeed';
import { GridItemEight, GridItemFour, GridLayout } from '@components/UI/GridLayout';
import formatHandle from '@lib/formatHandle';
import isFeatureEnabled from '@lib/isFeatureEnabled';
import { APP_NAME, STATIC_IMAGES_URL } from 'data/constants';
import type { Profile } from 'lens';
import { useProfileQuery } from 'lens';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Custom404 from 'src/pages/404';
import Custom500 from 'src/pages/500';
import { useAppStore } from 'src/store/app';

import Cover from './Cover';
import Details from './Details';
import Feed from './Feed';
import FeedType from './FeedType';
import NftGallery from './NftGallery';
import ProfilePageShimmer from './Shimmer';

const ViewProfile: NextPage = () => {
  const {
    query: { username, type }
  } = useRouter();
  const currentProfile = useAppStore((state) => state.currentProfile);
  const [feedType, setFeedType] = useState(
    type && ['feed', 'replies', 'media', 'nft'].includes(type as string)
      ? type.toString().toUpperCase()
      : 'FEED'
  );

  const handle = formatHandle(username as string, true);
  const { data, loading, error } = useProfileQuery({
    variables: { request: { handle }, who: currentProfile?.id ?? null },
    skip: !handle
  });

  if (error) {
    return <Custom500 />;
  }

  if (loading || !data) {
    return <ProfilePageShimmer />;
  }

  if (!data?.profile) {
    return <Custom404 />;
  }

  const profile = data?.profile;

  return (
    <>
      {profile?.name ? (
        <MetaTags title={`${profile?.name} (@${formatHandle(profile?.handle)}) • ${APP_NAME}`} />
      ) : (
        <MetaTags title={`@${formatHandle(profile?.handle)} • ${APP_NAME}`} />
      )}
      <Cover
        cover={
          profile?.coverPicture?.__typename === 'MediaSet'
            ? profile?.coverPicture?.original?.url
            : `${STATIC_IMAGES_URL}/patterns/2.svg`
        }
      />
      <GridLayout className="pt-6">
        <GridItemFour>
          <Details profile={profile as any} />
        </GridItemFour>
        <GridItemEight className="space-y-5">
          <FeedType stats={profile?.stats as any} setFeedType={setFeedType} feedType={feedType} />
          {(feedType === 'FEED' || feedType === 'REPLIES' || feedType === 'MEDIA') && (
            <Feed profile={profile as any} type={feedType} />
          )}
          {feedType === 'GALLERY' && isFeatureEnabled('nft-gallery', '0x2d') ? (
            <NftGallery profile={profile as Profile} />
          ) : (
            <NFTFeed profile={profile as Profile} />
          )}
        </GridItemEight>
      </GridLayout>
    </>
  );
};

export default ViewProfile;

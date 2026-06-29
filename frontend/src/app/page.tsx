import HeroSection from '@/components/home/HeroSection';
import FeaturedInterviews from '@/components/home/FeaturedInterviews';
import LatestArticles from '@/components/home/LatestArticles';
import RecentReleases from '@/components/home/RecentReleases';
import PopularTopics from '@/components/home/PopularTopics';
import '@/css/Home.css';

export default function Home() {
  return (
    <div className="home-page">
      <HeroSection />
      <div className="container">
        <FeaturedInterviews />
        <LatestArticles />
        
        <div className="grid-2" style={{ marginTop: '3rem' }}>
          <div>
            <RecentReleases />
          </div>
          <div>
            <PopularTopics />
          </div>
        </div>
      </div>
    </div>
  );
}

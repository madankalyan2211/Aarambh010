import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { RefreshCw, Calendar, User, ExternalLink, AlertCircle } from 'lucide-react';

interface TechArticle {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
}

export function TechUpdatesPage() {
  const [articles, setArticles] = useState<TechArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fetch tech updates from Google News RSS
  const fetchTechUpdates = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Using our backend proxy to fetch RSS feed
      const response = await fetch('/api/rss/tech-updates');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tech updates: ${response.status} ${response.statusText}`);
      }
      
      const xmlText = await response.text();
      
      // Validate XML response
      if (!xmlText.includes('<rss') || !xmlText.includes('<channel')) {
        throw new Error('Invalid RSS feed response');
      }
      
      // Parse XML manually since we can't use DOMParser in this environment
      // Extract items using regex
      const items: TechArticle[] = [];
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      const titleRegex = /<title>(.*?)<\/title>/;
      const descriptionRegex = /<description>(.*?)<\/description>/;
      const linkRegex = /<link>(.*?)<\/link>/;
      const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/;
      const guidRegex = /<guid[^>]*>(.*?)<\/guid>/;
      
      let match;
      while ((match = itemRegex.exec(xmlText)) !== null && items.length < 20) {
        const itemContent = match[1];
        
        const titleMatch = itemContent.match(titleRegex);
        const descriptionMatch = itemContent.match(descriptionRegex);
        const linkMatch = itemContent.match(linkRegex);
        const pubDateMatch = itemContent.match(pubDateRegex);
        const guidMatch = itemContent.match(guidRegex);
        
        // Extract source from title (Google News format: "Title - Source")
        let title = titleMatch ? titleMatch[1] : '';
        let source = '';
        if (title.includes(' - ')) {
          const parts = title.split(' - ');
          source = parts.pop() || '';
          title = parts.join(' - ');
        }
        
        items.push({
          id: guidMatch ? guidMatch[1] : Math.random().toString(),
          title,
          description: descriptionMatch ? descriptionMatch[1] : '',
          link: linkMatch ? linkMatch[1] : '',
          pubDate: pubDateMatch ? pubDateMatch[1] : '',
          source
        });
      }
      
      setArticles(items);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Error fetching tech updates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tech updates. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechUpdates();
    
    // Refresh every 30 minutes
    const interval = setInterval(fetchTechUpdates, 30 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen p-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold">Tech Updates</h1>
              <p className="text-muted-foreground mt-2">
                Latest technology news and updates from around the web
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {lastUpdated && `Last updated: ${lastUpdated}`}
              </div>
              <Button 
                onClick={fetchTechUpdates} 
                disabled={loading}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </motion.div>

        {error && (
          <Card className="p-6 mb-6">
            <div className="text-center text-red-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-4" />
              <p className="mb-4">{error}</p>
              <Button 
                onClick={fetchTechUpdates} 
                className="mt-4"
                variant="outline"
              >
                Try Again
              </Button>
            </div>
          </Card>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading tech updates...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-300">
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        <span>{article.source}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(article.pubDate)}</span>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-3 line-clamp-3">
                      {article.title}
                    </h3>
                    
                    <p className="text-muted-foreground text-sm mb-4 flex-grow line-clamp-3">
                      {article.description.replace(/<[^>]*>/g, '')}
                    </p>
                    
                    <div className="mt-auto">
                      <a 
                        href={article.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary hover:underline text-sm font-medium"
                      >
                        Read full article
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {!loading && articles.length === 0 && !error && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No tech updates available at the moment.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
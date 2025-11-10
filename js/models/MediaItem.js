// MediaItem Model
export class MediaItem {
    constructor(id, title, type, originCountry) {
        this.id = id;
        this.title = title;
        this.type = type; // 'movie', 'series'
        this.originCountry = originCountry; // 'Chinese', 'Korean', 'American'
        this.status = 'plan-to-watch';
        this.rating = null;
        this.review = '';
        this.currentEpisode = 0;
        this.totalEpisodes = null;
        this.dateAdded = new Date().toISOString();
        this.dateCompleted = null;
    }

    updateProgress(currentEpisode) {
        this.currentEpisode = currentEpisode;
        if (this.totalEpisodes && currentEpisode >= this.totalEpisodes) {
            this.status = 'completed';
            this.dateCompleted = new Date().toISOString();
        }
    }
}

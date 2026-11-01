import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({ name: 'youtubeEmbed', standalone: true })
export class YoutubeEmbedPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(videoId: string): SafeResourceUrl {
    // Only allow a valid YouTube ID shape, then trust the resulting URL
    const id = /^[\w-]{6,20}$/.test(videoId) ? videoId : '';
    const url = `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}

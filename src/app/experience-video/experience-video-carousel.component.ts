import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { YoutubeEmbedPipe } from './youtube-embed.pipe';

export interface Experience {
  id: number;
  position: number;
  startAt: string;
  endAt?: string;
  companyName: string;
  website?: string;
  logo: string;
  videoId?: string;
  internationalizations: { language: string; city: string; country: string; role: string; description: string }[];
  technologies: string[];
  medias: { icon: string; title: string; http: string }[];
  backgroundUrl: string;
}

// >>> CHANGE THIS to where your experiences JSON lives <<<
const EXPERIENCES_URL = 'assets/template/experience/experiences.json';
const LANGUAGE = 'en';

@Component({
  selector: 'app-experience-video-carousel',
  standalone: true,
  imports: [CommonModule, YoutubeEmbedPipe],
  template: `
  <section id="experiences" class="exp" *ngIf="current as exp"
           [style.backgroundImage]="'linear-gradient(rgba(0,0,0,.72),rgba(0,0,0,.9)), url(' + exp.backgroundUrl + ')'">
    <div class="exp__inner">
      <header class="exp__head">
        <h2>Experiences</h2>
        <nav>
          <button type="button" (click)="prev()" aria-label="Previous experience">&#8249; Previous</button>
          <span aria-hidden="true">|</span>
          <button type="button" (click)="next()" aria-label="Next experience">Next &#8250;</button>
        </nav>
      </header>

      <div class="exp__body">
        <div class="exp__media">
          <div class="video" *ngIf="exp.videoId; else logo">
            <iframe *ngIf="exp.videoId" [src]="exp.videoId | youtubeEmbed"
                    [title]="exp.companyName + ' experience video'"
                    allow="encrypted-media; picture-in-picture; fullscreen"
                    allowfullscreen loading="lazy"></iframe>
          </div>
          <ng-template #logo><img class="logo" [src]="exp.logo" [alt]="exp.companyName" /></ng-template>
        </div>

        <div class="exp__info" *ngIf="i18n(exp) as t">
          <h3><a *ngIf="exp.website; else plain" [href]="exp.website" target="_blank" rel="noopener">{{ exp.companyName }}</a>
              <ng-template #plain>{{ exp.companyName }}</ng-template></h3>
          <p class="period">{{ fmt(exp.startAt) }} – {{ exp.endAt ? fmt(exp.endAt) : 'Present' }}</p>
          <p class="role">{{ t.role }} · {{ t.city }}, {{ t.country }}</p>
          <p class="desc" [innerHTML]="t.description"></p>
        </div>
      </div>

      <div class="tags">
        <span *ngFor="let tech of exp.technologies">#{{ tech }}</span>
      </div>

      <div class="medias">
        <a *ngFor="let m of exp.medias" [href]="m.http" target="_blank" rel="noopener" [title]="m.title">{{ m.icon }}</a>
      </div>

      <ol class="timeline">
        <li *ngFor="let e of experiences; let i = index" [class.active]="i === index">
          <button type="button" (click)="go(i)" [attr.aria-label]="e.companyName">
            <span class="label">{{ fmt(e.startAt) }}</span><span class="dot"></span>
          </button>
        </li>
      </ol>
    </div>
  </section>
  `,
  styles: [`
    :host { display:block; }
    .exp { background-size:cover; background-position:center; color:#fff; padding:48px 0 32px; transition:background-image .3s; }
    .exp__inner { max-width:1100px; margin:0 auto; padding:0 24px; }
    .exp__head { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; }
    .exp__head h2 { font-size:2.2rem; margin:0; }
    .exp__head nav { display:flex; gap:16px; align-items:center; font-size:1.4rem; }
    .exp__head button { background:none; border:0; color:#fff; font:inherit; cursor:pointer; }
    .exp__head button:focus-visible, .timeline button:focus-visible { outline:2px solid #fff; outline-offset:4px; }
    .exp__body { display:grid; grid-template-columns:minmax(0,1.2fr) minmax(0,1fr); gap:32px; align-items:start; }
    .video { position:relative; width:100%; aspect-ratio:16/9; }
    .video iframe { position:absolute; inset:0; width:100%; height:100%; border:0; border-radius:12px; background:#000; }
    .logo { max-width:320px; width:100%; }
    .exp__info h3 { font-size:2rem; margin:0 0 4px; }
    .exp__info h3 a { color:inherit; text-decoration:none; }
    .period { opacity:.85; margin:0 0 4px; }
    .role { font-weight:600; margin:0 0 12px; }
    .desc { line-height:1.55; max-width:60ch; }
    .tags { display:flex; flex-wrap:wrap; gap:8px; margin:24px 0 8px; }
    .tags span { background:rgba(40,60,120,.8); padding:2px 8px; border-radius:3px; font-size:.95rem; }
    .medias { display:flex; gap:16px; margin:12px 0; }
    .medias a { color:#fff; text-transform:capitalize; }
    .timeline { list-style:none; display:flex; justify-content:space-between; margin:40px 0 0; padding:0; border-bottom:2px solid rgba(255,255,255,.35); }
    .timeline button { background:none; border:0; color:#fff; cursor:pointer; display:flex; flex-direction:column; align-items:center; gap:8px; padding:0 4px; }
    .timeline .dot { width:14px; height:14px; border-radius:50%; background:#fff; margin-bottom:-8px; }
    .timeline .active .dot { background:#1d2b5e; border:3px solid #fff; }
    .timeline .active .label { font-size:1.3rem; }
    @media (max-width:800px) {
      .exp__body { grid-template-columns:1fr; }
      .timeline .label { font-size:.7rem; }
    }
  `]
})
export class ExperienceVideoCarouselComponent implements OnInit {
  experiences: Experience[] = [];
  index = 0;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Experience[]>(EXPERIENCES_URL).subscribe(list => {
      this.experiences = [...list].sort((a, b) => a.position - b.position);
      this.index = this.experiences.length - 1; // start on the latest job
    });
  }

  get current(): Experience | undefined { return this.experiences[this.index]; }

  next() { this.go(this.index + 1); }
  prev() { this.go(this.index - 1); }
  go(i: number) {
    const n = this.experiences.length;
    if (n) this.index = ((i % n) + n) % n; // wraps; changing slide destroys the iframe, which stops the video
  }

  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;
    if (e.key === 'ArrowRight') this.next();
    if (e.key === 'ArrowLeft') this.prev();
  }

  i18n(exp: Experience) {
    return exp.internationalizations.find(t => t.language === LANGUAGE) ?? exp.internationalizations[0];
  }

  // JSON dates are MM-DD-YYYY
  fmt(d: string): string {
    const [m, , y] = d.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleString('en', { month: 'short', year: 'numeric' });
  }
}

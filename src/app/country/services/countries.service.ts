import { Injectable } from '@angular/core';

import { Country, Region, SmallCountry } from '../interfaces/country.interfaces';
import { Observable, combineLatest, map, of, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CountriesService {
  private baseUrl = "https://restcountries.com/v3.1";
  private _regions: Region[] = [Region.Africa, Region.Americas, Region.Asia, Region.Europe, Region.Oceania];

  constructor(private http: HttpClient) { }

  get regions(): Region[] {
    return [...this._regions];
  }

  getCountriesByRegion(region: Region): Observable<SmallCountry[]> {
    if (!region) return of([]);

    const url = `${this.baseUrl}/region/${region}?fields=name,cca3,borders`;
    return this.http.get<Country[]>(url).pipe(
      map(countries => countries.map( country => ({ name: country.name.common, cca3: country.cca3, borders: country.borders ?? [] }) )),
    )
  }

  getCountryByCode(code: string): Observable<SmallCountry> {
    const url = `${this.baseUrl}/alpha/${code}?fields=name,cca3,borders`;
    return this.http.get<Country>(url).pipe(
      // tap(console.log),
      map(country => ({ name: country.name.common, cca3: country.cca3, borders: country.borders ?? [] })),
    )
  }

  getCountryBordersByCode(borders: string[]): Observable<SmallCountry[]> {
    if (!borders || borders.length === 0) return of([]);

    const countryRequests: Observable<SmallCountry>[] = [];
    borders.forEach(code => {
      const request = this.getCountryByCode(code);
      countryRequests.push(request);
    });

    return combineLatest(countryRequests);
  }
}

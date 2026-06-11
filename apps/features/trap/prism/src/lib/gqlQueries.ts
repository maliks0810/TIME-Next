import { gql } from '@apollo/client';

export const PRISM_EQUITIES_BUYLIST_QUERY = 
    gql`
    query EquitiesAnalystBuyList {
        equitiesAnalystBuyList {
            results {
                results {
                    id
                    sector
                    industry
                    analyst
                    securityId
                    ticker
                    isin
                    securityName
                    marketCap
                    currentPrice
                    ytdPerformance
                    targetPrice
                    buyRecDate
                    removedDate
                    upside
                    esgScore
                    portfolioCount
                    tcwDollarExposure
                    portfolios
                    buyRecIndicator
                }
            message
            pageNbr
            status
            totalCount
            }
        }
    }
`;

export const PRISM_EQUITIES_DROPLIST_QUERY =
    gql`
    query EquitiesAnalystDropList {
        equitiesAnalystDropList {
            results {
                results {
                    id
                    sector
                    industry
                    analyst
                    securityId
                    ticker
                    isin
                    securityName
                    marketCap
                    currentPrice
                    ytdPerformance
                    targetPrice
                    buyRecDate
                    removedDate
                    upside
                    esgScore
                    portfolioCount
                    tcwDollarExposure
                    portfolios
                    buyRecIndicator
                }
                totalCount
                pageNbr
                status
                message
                }
            }
        }
    `;

export const PRISM_EQUITIES_COVERAGE_QUERY = 
    gql`
        query EquitiesAnalystCoverageList {
            equitiesAnalystCoverageList {
                results {
                    results {
                        coverageDate
                        securityKey
                        ticker
                        isin
                        companyName
                        sectorName
                        groupName
                        industryName
                        subIndustryName
                        benchmarkWeight
                        onBuyList
                        marketCap
                        mtd
                        qtd
                        ytd
                        analystName
                    }
                totalCount
                pageNbr
                status
                message
                }
            }
        }
    `;

export const PRISM_EQUITIES_ANALYST_PERFORMANCE_QUERY = 
gql`
query EquitiesAnalystPerformanceFilter($request: AnalystPerformanceFilterRequestInput!) {
  equitiesAnalystPerformanceFilter(request: $request) {
    results {
      results {
        annualizedReturns {
          date
          analystPerformance
          benchmarkPerformance
          excessReturn
        }
        name
        performanceMetrics {
          asOfDate
          periods {
            label
            start
            end
            observations
            portfolio {
              totalReturn
              cagr
              volAnn
              sharpeAnn
              maxDrawdown
            }
            benchmark {
              totalReturn
              cagr
              volAnn
              sharpeAnn
              maxDrawdown
            }
            excess {
              diff
              relative
            }
          }
          errorMessage
        }
        returns {
          date
          analystPerformance
          benchmarkPerformance
          excessReturn
        }
      }
      totalCount
      pageNbr
      status
      message
    }
  }
}
`;
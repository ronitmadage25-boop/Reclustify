import { useAuth } from '../context/AuthContext'
import styles from './AdminScreens.module.css'

export default function AdminAnalyticsScreen() {
  const { setCurrentScreen } = useAuth()

  return (
    <div className={styles.dashboard}>
      <div className={styles.banner}>
        <div className={styles.bannerLeft}>
          <div className={styles.badge}>CAMPUS ANALYTICS ENGINE // AGGREGATED</div>
          <h1 className={styles.bannerTitle}>PROBLEM INTELLIGENCE ANALYTICS</h1>
          <p className={styles.bannerSub}>
            SYSTEMIC INFRASTRUCTURE PATTERNS ACROSS CAMPUS ZONES & BUILDINGS.
          </p>
        </div>

        <div className={styles.bannerRight}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={() => setCurrentScreen('admin-dashboard')}
          >
            ← BACK TO DASHBOARD
          </button>
        </div>
      </div>

      {/* Analytics Highlights */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>COMPRESSION RATIO</span>
          <span className={`${styles.metricValue} ${styles.metricAccent}`}>10.1x</span>
          <span className={styles.metricNote}>142 COMPLAINTS → 14 CLUSTERS</span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>AVERAGE CLUSTER SIZE</span>
          <span className={styles.metricValue}>10.1</span>
          <span className={styles.metricNote}>STUDENTS PER PROBLEM SIGNAL</span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>PREVENTED DUPLICATE WORK</span>
          <span className={styles.metricValue}>128</span>
          <span className={styles.metricNote}>ISOLATED TRIPS AVOIDED</span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>INSTITUTIONAL EFFICIENCY</span>
          <span className={styles.metricValue}>+44%</span>
          <span className={styles.metricNote}>FIRST-TIME RESOLUTION ACCURACY</span>
        </div>
      </div>

      {/* Charts / Data Grid */}
      <div className={styles.analyticsGrid}>
        {/* Recurrence by Zone */}
        <div className={styles.analyticsCard}>
          <div className={styles.analyticsCardHeader}>
            <span className={styles.cardHeaderTitle}>RECURRENCE FREQUENCY BY CAMPUS ZONE</span>
            <span className={styles.cardHeaderTag}>LAST 30 DAYS</span>
          </div>

          <div className={styles.barChart}>
            <div className={styles.chartBarItem}>
              <div className={styles.chartBarTrack}>
                <div className={styles.chartBarProgress} style={{ height: '85%' }}></div>
              </div>
              <span className={styles.chartBarVal}>42</span>
              <span className={styles.chartBarLabel}>SCIENCE BLK</span>
            </div>

            <div className={styles.chartBarItem}>
              <div className={styles.chartBarTrack}>
                <div className={styles.chartBarProgress} style={{ height: '65%' }}></div>
              </div>
              <span className={styles.chartBarVal}>31</span>
              <span className={styles.chartBarLabel}>LIBRARY</span>
            </div>

            <div className={styles.chartBarItem}>
              <div className={styles.chartBarTrack}>
                <div className={styles.chartBarProgress} style={{ height: '50%' }}></div>
              </div>
              <span className={styles.chartBarVal}>24</span>
              <span className={styles.chartBarLabel}>ENGINEERING</span>
            </div>

            <div className={styles.chartBarItem}>
              <div className={styles.chartBarTrack}>
                <div className={styles.chartBarProgress} style={{ height: '40%' }}></div>
              </div>
              <span className={styles.chartBarVal}>19</span>
              <span className={styles.chartBarLabel}>DORM HOUSING</span>
            </div>

            <div className={styles.chartBarItem}>
              <div className={styles.chartBarTrack}>
                <div className={styles.chartBarProgress} style={{ height: '25%' }}></div>
              </div>
              <span className={styles.chartBarVal}>12</span>
              <span className={styles.chartBarLabel}>STUDENT UNION</span>
            </div>

            <div className={styles.chartBarItem}>
              <div className={styles.chartBarTrack}>
                <div className={styles.chartBarProgress} style={{ height: '18%' }}></div>
              </div>
              <span className={styles.chartBarVal}>09</span>
              <span className={styles.chartBarLabel}>SPORTS COMPLEX</span>
            </div>
          </div>
        </div>

        {/* Resolution Benchmark Table */}
        <div className={styles.analyticsCard}>
          <div className={styles.analyticsCardHeader}>
            <span className={styles.cardHeaderTitle}>DEPARTMENT RESOLUTION BENCHMARKS</span>
            <span className={styles.cardHeaderTag}>SLA COMPLIANCE</span>
          </div>

          <div className={styles.benchmarkList}>
            <div className={styles.benchmarkItem}>
              <div className={styles.benchDept}>
                <strong>IT INFRASTRUCTURE</strong>
                <span>Network & Computer Systems</span>
              </div>
              <div className={styles.benchMetrics}>
                <span className={styles.benchAvg}>1.8 DAYS AVG</span>
                <span className={styles.benchRate}>94% ON TIME</span>
              </div>
            </div>

            <div className={styles.benchmarkItem}>
              <div className={styles.benchDept}>
                <strong>CAMPUS FACILITIES</strong>
                <span>Electrical, HVAC & Elevators</span>
              </div>
              <div className={styles.benchMetrics}>
                <span className={styles.benchAvg}>2.9 DAYS AVG</span>
                <span className={styles.benchRate}>87% ON TIME</span>
              </div>
            </div>

            <div className={styles.benchmarkItem}>
              <div className={styles.benchDept}>
                <strong>HEALTH & SAFETY</strong>
                <span>Hazard Prevention & Ventilation</span>
              </div>
              <div className={styles.benchMetrics}>
                <span className={styles.benchAvg}>1.1 DAYS AVG</span>
                <span className={styles.benchRate}>98% ON TIME</span>
              </div>
            </div>

            <div className={styles.benchmarkItem}>
              <div className={styles.benchDept}>
                <strong>RESIDENTIAL HOUSING</strong>
                <span>Plumbing & Dorm Amenities</span>
              </div>
              <div className={styles.benchMetrics}>
                <span className={styles.benchAvg}>3.1 DAYS AVG</span>
                <span className={styles.benchRate}>82% ON TIME</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

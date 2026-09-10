import Nav from './components/Nav'
import Hero from './components/Hero'
import ProblemSection from './components/ProblemSection'
import MethodSection from './components/MethodSection'
import ReclusterSection from './components/ReclusterSection'
import IntelligenceSection from './components/IntelligenceSection'
import PrioritySection from './components/PrioritySection'
import ResolutionSection from './components/ResolutionSection'
import StatementSection from './components/StatementSection'
import AudienceSection from './components/AudienceSection'
import FinalCTA from './components/FinalCTA'
import './App.css'

export default function App() {
  return (
    <>
      <Nav />
      <main id="main-content">
        <Hero />
        <ProblemSection />
        <MethodSection />
        <ReclusterSection />
        <IntelligenceSection />
        <PrioritySection />
        <ResolutionSection />
        <StatementSection />
        <AudienceSection />
        <FinalCTA />
      </main>
    </>
  )
}

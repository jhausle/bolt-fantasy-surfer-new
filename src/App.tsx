import React from 'react';
import { Trophy, Users, History, PlusCircle, ChevronDown, Heading as Surfing, UserCircle, Award, TestTube, Scale } from 'lucide-react';
import EventHistory from './components/EventHistory';
import SurfersList from './components/SurfersList';
import MembersList from './components/MembersList';
import RosterUpdater from './components/RosterUpdater';
import LeagueStandings from './components/LeagueStandings';
import TestScraper from './components/TestScraper';
import TeamCompare from './components/TeamCompare';

function App() {
  const [activeTab, setActiveTab] = React.useState('events');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Freakin Yew!!! Fantasy Surfing League</h1>
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <PlusCircle size={20} />
              Add Event
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('surfers')}
              className={`flex items-center gap-2 px-3 py-4 text-sm font-medium ${
                activeTab === 'surfers'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Surfing size={20} />
              Surfers
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`flex items-center gap-2 px-3 py-4 text-sm font-medium ${
                activeTab === 'events'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Trophy size={20} />
              Events
            </button>
            <button
              onClick={() => setActiveTab('standings')}
              className={`flex items-center gap-2 px-3 py-4 text-sm font-medium ${
                activeTab === 'standings'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Award size={20} />
              Standings
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`flex items-center gap-2 px-3 py-4 text-sm font-medium ${
                activeTab === 'compare'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Scale size={20} />
              Compare
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`flex items-center gap-2 px-3 py-4 text-sm font-medium ${
                activeTab === 'members'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <UserCircle size={20} />
              Members
            </button>
            <button
              onClick={() => setActiveTab('test')}
              className={`flex items-center gap-2 px-3 py-4 text-sm font-medium ${
                activeTab === 'test'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <TestTube size={20} />
              Test
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Roster Updater - Show on Events tab */}
        {activeTab === 'events' && <RosterUpdater />}

        {activeTab === 'surfers' && <SurfersList />}
        {activeTab === 'events' && <EventHistory />}
        {activeTab === 'standings' && <LeagueStandings />}
        {activeTab === 'compare' && <TeamCompare />}
        {activeTab === 'members' && <MembersList />}
        {activeTab === 'test' && <TestScraper />}
      </main>
    </div>
  );
}

export default App;
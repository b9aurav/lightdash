import { NonIdealState, Spinner, Tab, Tabs } from '@blueprintjs/core';
import { subject } from '@casl/ability';
import { FC } from 'react';
import { Helmet } from 'react-helmet';
import {
    Redirect,
    Route,
    Switch,
    useHistory,
    useParams,
} from 'react-router-dom';
import ErrorState from '../components/common/ErrorState';
import PageBreadcrumbs from '../components/common/PageBreadcrumbs';
import DbtCloudSettings from '../components/DbtCloudSettings';
import ProjectUserAccess from '../components/ProjectAccess';
import { UpdateProjectConnection } from '../components/ProjectConnection';
import ProjectTablesConfiguration from '../components/ProjectTablesConfiguration/ProjectTablesConfiguration';
import SettingsScheduledDeliveries from '../components/SettingsScheduledDeliveries';
import SettingsUsageAnalytics from '../components/SettingsUsageAnalytics';
import { SettingsValidator } from '../components/SettingsValidator';
import { useProject } from '../hooks/useProject';
import { useApp } from '../providers/AppProvider';
import { useTracking } from '../providers/TrackingProvider';
import { EventName } from '../types/Events';
import { TabsWrapper } from './ProjectSettings.styles';

enum SettingsTabs {
    SETTINGS = 'settings',
    TABLES_CONFIGURATION = 'tablesConfiguration',
    PROJECT_ACCESS = 'projectAccess',
    USAGE_ANALYTICS = 'usageAnalytics',
    SCHEDULED_DELIVERIES = 'scheduledDeliveries',
    VALIDATOR = 'validator',
}

enum IntegrationsTabs {
    DBT_CLOUD = 'dbt-cloud',
}

const ProjectSettings: FC = () => {
    const history = useHistory();
    const { projectUuid, tab } = useParams<{
        projectUuid: string;
        tab?: SettingsTabs | IntegrationsTabs;
    }>();
    const { user } = useApp();

    const { isLoading, data: project, error } = useProject(projectUuid);
    const basePath = `/generalSettings/projectManagement/${projectUuid}`;
    const { track } = useTracking();

    const changeTab = (newTab: SettingsTabs | IntegrationsTabs) => {
        if (newTab === SettingsTabs.USAGE_ANALYTICS) {
            track({
                name: EventName.USAGE_ANALYTICS_CLICKED,
            });
        }

        if (newTab === IntegrationsTabs.DBT_CLOUD) {
            history.push(`${basePath}/integrations/${newTab}`);
        } else {
            history.push(`${basePath}/${newTab}`);
        }
    };

    if (error) {
        return <ErrorState error={error.error} />;
    }

    if (!tab) {
        return <Redirect to={`${basePath}/${SettingsTabs.SETTINGS}`} />;
    }

    if (isLoading || !project) {
        return (
            <div style={{ marginTop: '20px' }}>
                <NonIdealState title="Loading project" icon={<Spinner />} />
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>Project Settings - Lightdash</title>
            </Helmet>

            <PageBreadcrumbs
                items={[
                    {
                        title: 'All projects',
                        to: '/generalSettings/projectManagement',
                    },
                    {
                        title: project.name,
                        active: true,
                    },
                ]}
            />

            <TabsWrapper>
                <Tabs id="TabsExample" selectedTabId={tab} onChange={changeTab}>
                    <Tab id={SettingsTabs.SETTINGS} title="Project Settings" />
                    <Tab
                        id={SettingsTabs.TABLES_CONFIGURATION}
                        title="Tables Configuration"
                    />
                    <Tab
                        id={SettingsTabs.PROJECT_ACCESS}
                        title="Project Access"
                    />
                    <Tab id={IntegrationsTabs.DBT_CLOUD} title="dbt Cloud" />
                    {user.data?.ability?.can('view', 'Analytics') && (
                        <Tab
                            id={SettingsTabs.USAGE_ANALYTICS}
                            title="Usage Analytics"
                        />
                    )}
                    <Tab
                        id={SettingsTabs.SCHEDULED_DELIVERIES}
                        title="Scheduled Deliveries"
                    />

                    {user.data?.ability?.can(
                        'manage',
                        subject('Validation', {
                            organizationUuid: project.organizationUuid,
                            projectUuid,
                        }),
                    ) && <Tab id={SettingsTabs.VALIDATOR} title="Validator" />}
                </Tabs>
            </TabsWrapper>

            <Switch>
                <Route exact path={`${basePath}/${SettingsTabs.SETTINGS}`}>
                    <UpdateProjectConnection projectUuid={projectUuid} />
                </Route>

                <Route
                    exact
                    path={`${basePath}/${SettingsTabs.TABLES_CONFIGURATION}`}
                >
                    <ProjectTablesConfiguration projectUuid={projectUuid} />
                </Route>

                <Route
                    exact
                    path={`${basePath}/${SettingsTabs.PROJECT_ACCESS}`}
                >
                    <ProjectUserAccess projectUuid={projectUuid} />
                </Route>

                <Route
                    exact
                    path={`${basePath}/integrations/${IntegrationsTabs.DBT_CLOUD}`}
                >
                    <DbtCloudSettings projectUuid={projectUuid} />
                </Route>
                <Route
                    exact
                    path={`${basePath}/${SettingsTabs.USAGE_ANALYTICS}`}
                >
                    <SettingsUsageAnalytics projectUuid={projectUuid} />
                </Route>
                <Route
                    exact
                    path={`${basePath}/${SettingsTabs.SCHEDULED_DELIVERIES}`}
                >
                    <SettingsScheduledDeliveries projectUuid={projectUuid} />
                </Route>
                <Route exact path={`${basePath}/${SettingsTabs.VALIDATOR}`}>
                    <SettingsValidator projectUuid={projectUuid} />
                </Route>
                <Redirect to={basePath} />
            </Switch>
        </>
    );
};

export default ProjectSettings;

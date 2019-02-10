import React from 'react';
import { ScrollView, View, Alert, Text, ActivityIndicator, Dimensions, Image, TouchableOpacity } from 'react-native';
import { getI18nText } from '../utils/I18n';
import { FontAwesome } from '@expo/vector-icons';
import { CheckBox, Button } from 'react-native-elements';
import { Models } from '../dataStorage/models';
import { callWebServiceAsync, showWebServiceCallErrorsAsync } from '../dataStorage/storage';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import { getCurrentUser } from '../utils/user';
import Colors from '../constants/Colors';
import DatePicker from 'react-native-datepicker';
import { EventRegister } from 'react-native-event-listeners';

export default class AttendanceGroupScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: getI18nText('选择小组') + ` (${navigation.state.params.lessonTitle})`,
      headerLeft: (
        <View style={{ marginLeft: 10 }}>
          <TouchableOpacity onPress={() => navigateBack()}>
            <Image
              style={{ width: 34, height: 34 }}
              source={require('../assets/images/GoBack.png')} />
          </TouchableOpacity>
        </View>)
    };
  };

  state = {
    data: this.props.navigation.state.params.data,
    substitutes: {},
    busy: false,
    windowWidth: Dimensions.get('window').width
  };

  componentWillMount() {
    navigateBack = () => this.props.navigation.pop();
    this.listener = EventRegister.addEventListener('screenDimensionChanged', (window) => {
      this.setState({ windowWidth: window.width });
    });

    this.props.navigation.addListener('willFocus', () => {
      this.loadAsync();
    });
  }

  componentWillUnmount() {
    EventRegister.removeEventListener(this.listener)
  }

  async loadAsync() {
    try {
      this.setState({ busy: true });
      const lesson = this.props.navigation.state.params.lesson;
      const result = await callWebServiceAsync(`${Models.HostServer}/attendanceSummary/${getCurrentUser().getCellphone()}/${lesson}`, '', 'GET');
      const succeed = await showWebServiceCallErrorsAsync(result, 200);
      if (succeed) {
        const data = result.body;
        let substitutes = {};
        for (let i in data.substitute) {
          const item = data.substitute[i];
          substitutes[item.group] = item.name;
        }

        this.setState({ data: data, substitutes: substitutes });
      }
    }
    finally {
      this.setState({ busy: false });
    }
  }

  getRate(group, lesson) {
    let result = null;
    const attendance = this.state.data.attendance;
    for (let i in attendance) {
      if (attendance[i].lesson === lesson && attendance[i].group === group) {
        if (!result) {
          result = `${attendance[i].rate}%`;
        } else {
          return '*';
        }
      }
    }

    if (!result) {
      return '-';
    }

    return result;
  }

  render() {
    let keyIndex = 0;
    const groups = this.state.data.groups;
    const lesson = this.props.navigation.state.params.lesson;
    const lessonTitle = this.props.navigation.state.params.lessonTitle;
    const substitutes = this.state.substitutes;
    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{ backgroundColor: 'white' }}>
          {
            groups.map(group => {
              if (group.lesson !== 0 && lesson !== group.lesson) {
                return <View key={keyIndex++} />;
              }

              return (
                <TouchableOpacity
                  key={keyIndex++}
                  onPress={() => this.props.navigation.navigate('AttendanceLesson', {
                    lesson, lessonTitle, group, substitute: substitutes[group.id], data: this.props.navigation.state.params.data
                  })}>
                  <View style={{
                    borderColor: '#cdcdcd',
                    backgroundColor: Colors.yellow,
                    borderWidth: 0.5,
                    borderRadius: 10,
                    height: 140,
                    margin: 5,
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Text style={{
                      fontSize: 20,
                      fontWeight: 'bold',
                      color: 'white'
                    }}>{group.id}组</Text>
                    <Text style={{
                      fontSize: 16,
                      fontWeight: 'bold',
                      color: 'white'
                    }}>{group.name}</Text>
                    {
                      group.lesson !== 0 &&
                      <Text style={{
                        fontSize: 14,
                        color: '#fefefe'
                      }}>{'(' + getI18nText('代理组长') + ')'}</Text>
                    }
                    {
                      substitutes[group.id] &&
                      <Text style={{
                        fontSize: 14,
                        color: '#fefefe'
                      }}>{'(' + substitutes[group.id] + getI18nText('代理') + ')'}</Text>
                    }
                    <View style={{ height: 10 }} />
                    <Text style={{
                      fontSize: 20,
                      fontWeight: 'bold',
                      color: 'white'
                    }}>{this.getRate(group.id, lesson)}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          }
          <View style={{ height: 80 }} />
        </ScrollView>
      </View >
    );
  }
}
